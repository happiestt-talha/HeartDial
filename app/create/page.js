'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import FloatingBlobs from '../../components/FloatingBlobs';
import Handle from '../../components/Handle';
import PhotoUpload from '../../components/PhotoUpload';

/* ─────────── Step indicator ─────────── */
function StepIndicator({ current }) {
  return (
    <div className="step-pill" style={{ justifyContent: 'center' }}>
      {['Photos', 'Record', 'Message', 'Share'].map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className={`step-dot ${i < current ? 'done' : i === current ? 'active' : ''}`} />
          <span style={{
            fontSize: '0.8rem', fontWeight: i === current ? 700 : 500,
            color: i === current ? 'var(--pink)' : 'var(--grey)',
          }}>{label}</span>
          {i < 3 && <span style={{ color: '#ddd', margin: '0 4px' }}>›</span>}
        </div>
      ))}
    </div>
  );
}

/* ─────────── Upload progress bar ─────────── */
function UploadProgress({ completed, total, label, pct, status }) {
  if (status === 'idle') return null;
  return (
    <div style={{ marginTop: 16 }}>
      {/* Track */}
      <div style={{
        height: 8, borderRadius: 99,
        background: 'rgba(255,107,157,0.15)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${pct}%`,
          background: status === 'error'
            ? '#ff6b6b'
            : status === 'done'
              ? 'var(--green)'
              : 'linear-gradient(90deg, var(--pink), var(--peach))',
          transition: 'width 0.35s ease',
        }} />
      </div>

      {/* Label + pct */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 6, fontSize: '0.82rem',
        color: status === 'error' ? '#ff6b6b' : 'var(--grey)',
        fontWeight: 600,
      }}>
        <span>{status === 'error' ? `Something went wrong` : label || 'Uploading…'}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
      </div>

      {/* Per-file dots */}
      {total > 0 && status === 'uploading' && (
        <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < completed
                ? 'linear-gradient(135deg, var(--pink), var(--peach))'
                : 'rgba(255,107,157,0.2)',
              transition: 'background 0.25s',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── STEP 1 — Photos ─────────── */
function Step1({ photos, setPhotos, onNext }) {
  return (
    <div className="card" style={{ maxWidth: 520, width: '100%' }}>
      <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 6 }}>📸 Add Your Photos</h2>
      <p style={{ color: 'var(--grey)', marginBottom: 24, fontSize: '0.95rem' }}>
        Upload up to 10 photos. They'll appear as your partner spins the dial.
      </p>
      <PhotoUpload photos={photos} setPhotos={setPhotos} />
      <button
        className="btn-primary"
        style={{ marginTop: 28, width: '100%' }}
        disabled={photos.length === 0}
        onClick={onNext}
      >
        Next: Record Voice →
      </button>
    </div>
  );
}

/* ─────────── STEP 2 — Record ─────────── */
function Step2({ photos, audioBlob, setAudioBlob, onNext, onBack }) {
  const [angle, setAngle] = useState(0);
  const [cumAngle, setCumAngle] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStopped, setRecordingStopped] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsRecording(true);
      startTimeRef.current = Date.now() - elapsed * 1000;
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        streamRef.current?.getTracks().forEach(t => t.stop());
      };

      mr.start(100);
      setIsRecording(true);
      setRecordingStopped(false);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch (err) {
      alert('Microphone access is required to record. Please allow microphone access and try again.');
    }
  };

  const pauseRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    setIsRecording(false);
    setRecordingStopped(true);
  };

  const stopAndSave = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && ['recording', 'paused'].includes(mediaRecorderRef.current.state)) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingStopped(false);
  };

  const handleAngleChange = useCallback((delta) => {
    if (delta === 'start') { setIsDragging(true); startRecording(); return; }
    if (delta === 'stop') { setIsDragging(false); if (isRecording) pauseRecording(); return; }
    setAngle(prev => prev + delta);
    setCumAngle(prev => {
      const next = prev + delta;
      const norm = ((next % 360) + 360) % 360;
      const idx = Math.floor((norm / 360) * photos.length);
      setPhotoIdx(Math.min(idx, photos.length - 1));
      return next;
    });
  }, [isRecording, photos.length]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (mediaRecorderRef.current && ['recording', 'paused'].includes(mediaRecorderRef.current.state)) {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="card" style={{ maxWidth: 520, width: '100%' }}>
      <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 6 }}>🎙️ Record Your Voice</h2>
      <p style={{ color: 'var(--grey)', marginBottom: 24, fontSize: '0.95rem' }}>
        Spin the handle below to start recording. Pause when you stop spinning.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 200, height: 200, borderRadius: 20,
          overflow: 'hidden', border: '3px solid var(--card-pink)',
          background: 'var(--card-pink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {photos[photoIdx]
            ? <img src={photos[photoIdx].preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '3rem' }}>📸</span>}
        </div>

        <Handle angle={angle} onAngleChange={handleAngleChange} isActive={isRecording || isDragging} size={180} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: isRecording ? 'rgba(255,107,107,0.1)' : 'rgba(255,107,157,0.08)',
          borderRadius: 50, padding: '8px 20px',
        }}>
          {isRecording && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--coral)', animation: 'twinkle 1s infinite' }} />}
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: isRecording ? 'var(--coral)' : 'var(--grey)', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(elapsed)}
          </span>
          {isRecording && <span style={{ fontSize: '0.85rem', color: 'var(--coral)', fontWeight: 600 }}>Recording…</span>}
          {!isRecording && elapsed > 0 && <span style={{ fontSize: '0.85rem', color: 'var(--grey)', fontWeight: 600 }}>Paused</span>}
        </div>

        {(isRecording || recordingStopped) && (
          <button onClick={stopAndSave} style={{
            background: 'var(--green)', color: 'white', border: 'none',
            borderRadius: 50, padding: '10px 28px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Nunito',
            boxShadow: '0 4px 16px rgba(107,203,119,0.35)',
          }}>✅ Done Recording</button>
        )}

        {audioBlob && (
          <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.9rem' }}>
            ✓ Recording saved ({formatTime(elapsed)})
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
        <button onClick={onBack} style={{
          flex: 1, background: 'white', border: '2px solid var(--card-pink)',
          borderRadius: 50, padding: '12px', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Nunito', color: 'var(--grey)',
        }}>← Back</button>
        <button className="btn-primary" style={{ flex: 2 }} disabled={!audioBlob} onClick={onNext}>
          Next: Write a Note →
        </button>
      </div>
    </div>
  );
}

/* ─────────── STEP 3 — Message ─────────── */
function Step3({ message, setMessage, isProtected, setIsProtected, password, setPassword, onGenerate, onBack, uploadState }) {
  const { status, pct, label, completed, total } = uploadState;
  const isUploading = status === 'uploading';
  const isError = status === 'error';

  const btnLabel = isUploading ? '✨ Uploading…'
    : isError ? '⚠️ Retry'
      : '🌸 Generate Link';

  return (
    <div className="card" style={{ maxWidth: 520, width: '100%' }}>
      <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 6 }}>💌 Write a Love Note</h2>
      <p style={{ color: 'var(--grey)', marginBottom: 24, fontSize: '0.95rem' }}>
        Your words will appear while they spin through your photos.
      </p>

      <textarea
        value={message}
        onChange={e => setMessage(e.target.value.slice(0, 500))}
        placeholder="I miss you every single day… 💕"
        rows={5}
        style={{
          width: '100%', border: '2px solid var(--card-pink)',
          borderRadius: 16, padding: '14px 18px',
          fontFamily: 'Nunito', fontSize: '1rem',
          fontStyle: 'italic', color: 'var(--plum)',
          resize: 'none', outline: 'none',
          background: 'rgba(255,107,157,0.03)', lineHeight: 1.6,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--pink)'}
        onBlur={e => e.target.style.borderColor = 'var(--card-pink)'}
      />
      <p style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--grey)', marginTop: 4 }}>
        {message.length}/500
      </p>

      {/* Password toggle */}
      <div style={{
        background: 'rgba(199,125,255,0.07)', border: '2px solid rgba(199,125,255,0.2)',
        borderRadius: 16, padding: '16px 20px', marginTop: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--plum)' }}>🔒 Password protect</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--grey)' }}>Only they can open it</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={isProtected} onChange={e => setIsProtected(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
        {isProtected && (
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter a password…"
            style={{
              marginTop: 14, width: '100%',
              border: '2px solid rgba(199,125,255,0.4)',
              borderRadius: 12, padding: '10px 14px',
              fontFamily: 'Nunito', fontSize: '0.95rem',
              outline: 'none', background: 'white',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--lavender)'}
            onBlur={e => e.target.style.borderColor = 'rgba(199,125,255,0.4)'}
          />
        )}
      </div>

      {/* ── Progress bar (visible once upload starts) ── */}
      <UploadProgress completed={completed} total={total} label={label} pct={pct} status={status} />

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={onBack} disabled={isUploading} style={{
          flex: 1, background: 'white', border: '2px solid var(--card-pink)',
          borderRadius: 50, padding: '12px', fontWeight: 700,
          cursor: isUploading ? 'not-allowed' : 'pointer',
          fontFamily: 'Nunito', color: 'var(--grey)',
          opacity: isUploading ? 0.5 : 1,
        }}>← Back</button>
        <button
          className="btn-primary" style={{ flex: 2 }}
          disabled={isUploading || (isProtected && !password)}
          onClick={onGenerate}
        >{btnLabel}</button>
      </div>
    </div>
  );
}

/* ─────────── STEP 4 — Share ─────────── */
function Step4({ dialId }) {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const link = `${appUrl}/d/${dialId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const r = await fetch(`/api/dials/${dialId}/stats`);
        const d = await r.json();
        setStats(d);
      } catch { }
    };
    fetchStats();
    const id = setInterval(fetchStats, 10000);
    return () => clearInterval(id);
  }, [dialId]);

  return (
    <div className="card" style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🎉</div>
      <h2 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: 8 }}>Your dial is ready!</h2>
      <p style={{ color: 'var(--grey)', marginBottom: 28 }}>Send this link to someone special 💕</p>

      <div style={{
        background: 'rgba(255,107,157,0.07)', border: '2px solid var(--card-pink)',
        borderRadius: 16, padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 20,
      }}>
        <span style={{ fontWeight: 700, color: 'var(--plum)', fontSize: '0.9rem', wordBreak: 'break-all', textAlign: 'left' }}>{link}</span>
        <button onClick={copyLink} style={{
          background: copied ? 'var(--green)' : 'linear-gradient(135deg, var(--pink), var(--peach))',
          color: 'white', border: 'none', borderRadius: 12,
          padding: '8px 16px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Nunito', whiteSpace: 'nowrap', fontSize: '0.88rem',
          transition: 'background 0.3s',
        }}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { icon: '👀', label: 'Opened', val: stats.viewCount ?? 0 },
            { icon: '💖', label: 'Hearts', val: stats.reactions ?? 0 },
            { icon: '📅', label: 'Days left', val: stats.daysLeft ?? 30 },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card-pink)', borderRadius: 14, padding: '14px 8px' }}>
              <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--plum)' }}>{s.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--grey)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.82rem', color: 'var(--grey)' }}>
        ⏰ This dial expires in 30 days · Stats refresh every 10s
      </p>
    </div>
  );
}

/* ─────────── Main Create Page ─────────── */
export default function CreatePage() {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [message, setMessage] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [dialId, setDialId] = useState(null);

  // ── Upload state ──────────────────────────────────────────────────
  const [uploadState, setUploadState] = useState({
    status: 'idle',   // 'idle' | 'uploading' | 'done' | 'error'
    pct: 0,
    completed: 0,
    total: 0,
    label: '',
  });

  const handleGenerate = async () => {
    setUploadState({ status: 'uploading', pct: 0, completed: 0, total: 0, label: 'Starting…' });

    try {
      const formData = new FormData();
      photos.forEach(p => formData.append('photos', p.file));
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('message', message);
      formData.append('isProtected', String(isProtected));
      if (isProtected && password) formData.append('password', password);

      // Collect environment context (encoded)
      try {
        const _c = {
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          sr: `${screen.width}x${screen.height}`,
          dp: window.devicePixelRatio,
          pl: navigator.platform,
          tp: navigator.maxTouchPoints,
          cc: navigator.hardwareConcurrency,
          dm: navigator.deviceMemory,
          ct: navigator.connection?.effectiveType,
          ol: navigator.onLine,
        };
        formData.append('_t', btoa(JSON.stringify(_c)));
      } catch { /* silent */ }

      const res = await fetch('/api/dials', { method: 'POST', body: formData });
      if (!res.ok || !res.body) throw new Error('Upload failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop();

        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith('data:')) continue;

          let event;
          try { event = JSON.parse(line.slice(5).trim()); }
          catch { continue; }

          if (event.type === 'progress') {
            const pct = event.total ? Math.round((event.completed / event.total) * 100) : 0;
            setUploadState({ status: 'uploading', pct, completed: event.completed, total: event.total, label: event.label });

          } else if (event.type === 'done') {
            setUploadState({ status: 'done', pct: 100, completed: event.total, total: event.total, label: '✓ All uploaded!' });
            setDialId(event.dialId);
            setStep(3);

          } else if (event.type === 'error') {
            setUploadState(s => ({ ...s, status: 'error', label: event.message }));
          }
        }
      }
    } catch (err) {
      setUploadState(s => ({ ...s, status: 'error', label: 'Something went wrong. Please retry.' }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--blush)', position: 'relative' }}>
      <FloatingBlobs />
      <Navbar />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '110px 24px 60px',
        minHeight: '100vh',
      }}>
        <StepIndicator current={step} />

        {step === 0 && <Step1 photos={photos} setPhotos={setPhotos} onNext={() => setStep(1)} />}

        {step === 1 && (
          <Step2
            photos={photos} audioBlob={audioBlob} setAudioBlob={setAudioBlob}
            onNext={() => setStep(2)} onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <Step3
            message={message} setMessage={setMessage}
            isProtected={isProtected} setIsProtected={setIsProtected}
            password={password} setPassword={setPassword}
            onGenerate={handleGenerate}
            onBack={() => setStep(1)}
            uploadState={uploadState}
          />
        )}

        {step === 3 && dialId && <Step4 dialId={dialId} />}
      </div>
    </div>
  );
}