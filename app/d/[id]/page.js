'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Handle from '../../../components/Handle';

/* ─── Floating heart burst ─── */
function spawnHearts(count = 8) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.className = 'float-heart';
      el.textContent = ['💖','💕','❤️','💗','💞'][Math.floor(Math.random() * 5)];
      el.style.left = (30 + Math.random() * 40) + 'vw';
      el.style.bottom = '10vh';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }, i * 80);
  }
}

/* ─── Password gate ─── */
function PasswordGate({ dialId, onVerified }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setLoading(true); setError(false);
    try {
      const r = await fetch(`/api/dials/${dialId}/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) onVerified();
      else { setError(true); }
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 24 }}>
      <div style={{
        background: 'white', borderRadius: 28, padding: '48px 40px',
        textAlign: 'center', maxWidth: 380, width: '100%',
        boxShadow: '0 8px 40px rgba(255,107,157,0.15)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 8 }}>Protected Dial</h2>
        <p style={{ color: 'var(--grey)', marginBottom: 24, fontSize: '0.95rem' }}>Enter the password to open this dial.</p>
        <input
          type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && verify()}
          placeholder="Password…"
          style={{
            width: '100%', border: `2px solid ${error ? 'var(--coral)' : 'var(--card-lav)'}`,
            borderRadius: 12, padding: '12px 16px', fontFamily: 'Nunito',
            fontSize: '1rem', outline: 'none', marginBottom: 16,
            color: 'var(--plum)',
          }}
        />
        {error && <p style={{ color: 'var(--coral)', fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Wrong password. Try again.</p>}
        <button className="btn-primary" style={{ width: '100%' }} onClick={verify} disabled={!pw || loading}>
          {loading ? 'Checking…' : 'Open 💕'}
        </button>
      </div>
    </div>
  );
}

/* ─── Main viewer ─── */
function DialViewer({ dial, dialId }) {
  const [angle, setAngle] = useState(0);
  const [cumAngle, setCumAngle] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [heartCount, setHeartCount] = useState(dial.reactions || 0);

  const audioRef = useRef(null);

  useEffect(() => {
    if (dial.audioUrl) {
      audioRef.current = new Audio(dial.audioUrl);
      audioRef.current.loop = false;
    }
    return () => { audioRef.current?.pause(); };
  }, [dial.audioUrl]);

  const handleAngleChange = useCallback((delta) => {
    if (delta === 'start') {
      setIsSpinning(true);
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      return;
    }
    if (delta === 'stop') {
      setIsSpinning(false);
      if (audioRef.current) audioRef.current.pause();
      return;
    }
    setAngle(prev => prev + delta);
    setCumAngle(prev => {
      const next = prev + delta;
      const norm = ((next % 360) + 360) % 360;
      const idx = Math.floor((norm / 360) * dial.photoUrls.length);
      setPhotoIdx(Math.min(idx, dial.photoUrls.length - 1));
      return next;
    });
  }, [dial.photoUrls.length]);

  const sendHeart = async () => {
    if (reacted) return;
    setReacted(true);
    spawnHearts(10);
    setHeartCount(c => c + 1);
    try {
      await fetch(`/api/dials/${dialId}/react`, { method: 'POST' });
    } catch {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '24px 24px 60px' }}>
      {/* Photo */}
      <div style={{
        width: 280, height: 280, borderRadius: 24,
        overflow: 'hidden', border: '3px solid var(--card-pink)',
        boxShadow: '0 8px 32px rgba(255,107,157,0.2)',
        background: 'var(--card-pink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src={dial.photoUrls[photoIdx]}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Handle */}
      <Handle angle={angle} onAngleChange={handleAngleChange} isActive={isSpinning} size={200}/>

      {isSpinning ? (
        <p style={{ color: 'var(--pink)', fontWeight: 700, fontSize: '0.9rem', animation: 'twinkle 1s infinite' }}>
          🎙 Playing…
        </p>
      ) : (
        <p style={{ color: 'var(--grey)', fontSize: '0.88rem', fontWeight: 600 }}>
          Spin the handle to hear their voice 🎧
        </p>
      )}

      {/* Message */}
      {dial.message && (
        <div style={{
          background: 'white',
          border: '2px solid var(--card-pink)',
          borderRadius: 20, padding: '20px 24px',
          maxWidth: 360, width: '100%',
          textAlign: 'center',
        }}>
          <p style={{ fontStyle: 'italic', color: 'var(--plum)', lineHeight: 1.7, fontSize: '1rem' }}>
            "{dial.message}"
          </p>
        </div>
      )}

      {/* Heart reaction */}
      <button
        onClick={sendHeart}
        style={{
          background: reacted
            ? 'linear-gradient(135deg, var(--coral), var(--pink))'
            : 'white',
          border: '2.5px solid var(--pink)',
          borderRadius: 50, padding: '12px 32px',
          fontFamily: 'Nunito', fontWeight: 800, fontSize: '1rem',
          cursor: reacted ? 'default' : 'pointer',
          color: reacted ? 'white' : 'var(--pink)',
          boxShadow: '0 4px 20px rgba(255,107,157,0.25)',
          transition: 'all 0.3s',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
        disabled={reacted}
      >
        {reacted ? '💖 Sent!' : '💗 Send a heart back'}
        <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>({heartCount})</span>
      </button>
    </div>
  );
}

/* ─── Main page ─── */
export default function ViewPage() {
  const { id } = useParams();
  const [state, setState] = useState('loading'); // loading | password | ready | expired | notfound | error
  const [dial, setDial] = useState(null);

  const fetchDial = useCallback(async (skipPassword = false) => {
    try {
      const r = await fetch(`/api/dials/${id}`);
      if (r.status === 404) { setState('notfound'); return; }
      if (r.status === 410) { setState('expired'); return; }
      if (!r.ok) { setState('error'); return; }
      const data = await r.json();
      if (data.isProtected && !skipPassword) {
        setState('password');
      } else {
        setDial(data);
        setState('ready');
      }
    } catch { setState('error'); }
  }, [id]);

  useEffect(() => { fetchDial(); }, [fetchDial]);

  if (state === 'loading') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12, animation: 'twinkle 1s infinite' }}>💖</div>
        <p style={{ color: 'var(--grey)', fontWeight: 600 }}>Loading your dial…</p>
      </div>
    </div>
  );

  if (state === 'notfound') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
        <h2 style={{ fontWeight: 900, marginBottom: 8 }}>Dial not found</h2>
        <p style={{ color: 'var(--grey)' }}>This link doesn't exist or may have been removed.</p>
      </div>
    </div>
  );

  if (state === 'expired') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⌛</div>
        <h2 style={{ fontWeight: 900, marginBottom: 8 }}>This dial has expired</h2>
        <p style={{ color: 'var(--grey)' }}>Dials last 30 days. Ask them to create a new one 💕</p>
      </div>
    </div>
  );

  if (state === 'error') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>😢</div>
        <h2 style={{ fontWeight: 900, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: 'var(--grey)' }}>Please try refreshing the page.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--blush)' }}>
      <Navbar />
      <div style={{ paddingTop: 90, position: 'relative', zIndex: 1 }}>
        {state === 'password' && (
          <PasswordGate dialId={id} onVerified={() => {
            // After verification, fetch and display without password gate
            fetch(`/api/dials/${id}`).then(r => r.json()).then(data => {
              setDial(data);
              setState('ready');
            });
          }}/>
        )}
        {state === 'ready' && dial && <DialViewer dial={dial} dialId={id}/>}
      </div>
    </div>
  );
}
