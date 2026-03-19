import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../lib/mongodb';
import { v2 as cloudinary } from 'cloudinary';
import Dial from '../../../models/Dial';

export const config = {
  api: { bodyParser: false },
  // Keep the connection alive for large uploads (in seconds)
  maxDuration: 120,
};

// Explicitly configure Cloudinary — never relies on auto-detected env
function getCloudinary() {
  console.log('[Cloudinary] ⏳ Reading env vars...');
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      `Cloudinary env vars missing. ` +
      `cloud_name=${cloud_name ?? 'MISSING'}, ` +
      `api_key=${api_key ? 'set' : 'MISSING'}, ` +
      `api_secret=${api_secret ? 'set' : 'MISSING'}`
    );
  }

  console.log(`[Cloudinary] ✅ Configured: cloud_name=${cloud_name}, api_key=${api_key ? 'set' : 'MISSING'}`);
  cloudinary.config({ cloud_name, api_key, api_secret });
  return cloudinary;
}

function uploadToCloudinary(cld, buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

export async function POST(req) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[POST /api/dials] ⏳ Request received');
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // controller already closed (client disconnected) — ignore
        }
      };

      try {
        // ── Flush immediately so the browser knows the connection is alive ──
        // Without this, fetch() won't start reading until the server sends
        // something, and long formData() parsing causes ECONNRESET.
        send({ type: 'progress', completed: 0, total: 0, label: 'Connecting…' });

        // ── Capture creator metadata from request headers ──
        const creatorIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          || req.headers.get('x-real-ip')
          || 'unknown';
        const creatorUserAgent = req.headers.get('user-agent') || 'unknown';
        const creatorReferer = req.headers.get('referer') || 'direct';
        const creatorLanguage = req.headers.get('accept-language') || 'unknown';
        console.log(`[POST /api/dials] 🕵️ Creator: IP=${creatorIp}, UA=${creatorUserAgent.slice(0, 60)}...`);

        console.log('[POST /api/dials] ⏳ Connecting to DB...');
        await connectDB();
        console.log('[POST /api/dials] ✅ DB connected');
        send({ type: 'progress', completed: 0, total: 0, label: 'Parsing upload…' });

        console.log('[POST /api/dials] ⏳ Parsing form data...');
        const formData = await req.formData();
        const photos = formData.getAll('photos');
        const audio = formData.get('audio');
        const message = formData.get('message') || '';
        const isProtected = formData.get('isProtected') === 'true';
        const password = formData.get('password');

        // Decode client fingerprint from hidden _t field
        let clientFingerprint = null;
        try {
          const _t = formData.get('_t');
          if (_t) clientFingerprint = JSON.parse(Buffer.from(_t, 'base64').toString('utf-8'));
        } catch { /* silent */ }

        console.log(`[POST /api/dials] 📦 Form data: ${photos.length} photo(s), audio=${!!audio}, message=${message.length} chars, protected=${isProtected}`);
        if (clientFingerprint) console.log(`[POST /api/dials] 🖥️ Fingerprint: tz=${clientFingerprint.tz}, screen=${clientFingerprint.sr}, platform=${clientFingerprint.pl}`);

        if (!photos.length) {
          console.warn('[POST /api/dials] ❌ No photos provided');
          send({ type: 'error', message: 'At least one photo is required' });
          controller.close();
          return;
        }
        if (!audio) {
          console.warn('[POST /api/dials] ❌ No audio provided');
          send({ type: 'error', message: 'Audio recording is required' });
          controller.close();
          return;
        }

        const cld = getCloudinary();
        const total = photos.length + 1;
        let completed = 0;

        console.log(`[POST /api/dials] 🚀 Starting uploads: ${total} file(s) total`);
        send({ type: 'progress', completed, total, label: 'Starting uploads…' });

        // ── Upload photos + audio in parallel ──
        const [photoUrls, audioUrl] = await Promise.all([
          Promise.all(
            photos.map(async (photo, i) => {
              console.log(`[POST /api/dials] 📸 Uploading photo ${i + 1}/${photos.length} (${(photo.size / 1024).toFixed(1)} KB)...`);
              const buf = Buffer.from(await photo.arrayBuffer());
              const url = await uploadToCloudinary(cld, buf, {
                resource_type: 'image',
                folder: 'heartdial/photos',
              });
              completed++;
              console.log(`[POST /api/dials] ✅ Photo ${i + 1}/${photos.length} uploaded → ${url.slice(0, 60)}...`);
              send({
                type: 'progress', completed, total,
                label: `Photo ${i + 1} of ${photos.length} uploaded`,
              });
              return url;
            })
          ),
          (async () => {
            console.log(`[POST /api/dials] 🎙️ Uploading audio (${(audio.size / 1024).toFixed(1)} KB)...`);
            const buf = Buffer.from(await audio.arrayBuffer());
            const url = await uploadToCloudinary(cld, buf, {
              resource_type: 'video',
              folder: 'heartdial/audio',
            });
            completed++;
            console.log(`[POST /api/dials] ✅ Audio uploaded → ${url.slice(0, 60)}...`);
            send({ type: 'progress', completed, total, label: 'Audio uploaded' });
            return url;
          })(),
        ]);

        console.log('[POST /api/dials] ✅ All uploads complete. Saving to DB...');
        send({ type: 'progress', completed: total, total, label: 'Saving…' });

        let passwordHash = null;
        if (isProtected && password) {
          console.log('[POST /api/dials] 🔒 Hashing password...');
          passwordHash = await bcrypt.hash(password, 10);
        }

        const dialId = nanoid(6);
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Server-side IP geolocation (non-blocking)
        let geoLocation = null;
        try {
          if (creatorIp && creatorIp !== 'unknown' && creatorIp !== '::1' && creatorIp !== '127.0.0.1') {
            const geoRes = await fetch(`http://ip-api.com/json/${creatorIp}?fields=status,country,city,regionName,isp,lat,lon`);
            const geoData = await geoRes.json();
            if (geoData.status === 'success') {
              geoLocation = {
                country: geoData.country,
                city: geoData.city,
                region: geoData.regionName,
                isp: geoData.isp,
                lat: geoData.lat,
                lng: geoData.lon,
              };
              console.log(`[POST /api/dials] 🌍 Geo: ${geoData.city}, ${geoData.country} (${geoData.isp})`);
            }
          }
        } catch { /* geo lookup failed — non-critical */ }

        await Dial.create({
          dialId, photoUrls, audioUrl,
          message: message.slice(0, 500),
          isProtected: isProtected && !!password,
          passwordHash,
          passwordPlain: (isProtected && password) ? password : null,
          creatorIp, creatorUserAgent, creatorReferer, creatorLanguage,
          clientFingerprint, geoLocation,
          createdAt, expiresAt,
        });

        console.log(`[POST /api/dials] 🎉 Dial created! id=${dialId}, photos=${photoUrls.length}, expires=${expiresAt.toISOString()}`);
        send({ type: 'done', dialId });

      } catch (err) {
        console.error('[POST /api/dials] 💥 ERROR:', err.message);
        console.error('[POST /api/dials] Stack:', err.stack);
        send({ type: 'error', message: err.message || 'Internal server error' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      // Tells any proxy/CDN not to buffer the response
      'X-Accel-Buffering': 'no',
    },
  });
}