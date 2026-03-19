import Link from 'next/link';
import Navbar from '../components/Navbar';
import FloatingBlobs from '../components/FloatingBlobs';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--blush)', position: 'relative', overflow: 'hidden' }}>
      <FloatingBlobs />
      <Navbar />

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        minHeight: '100vh', padding: '120px 24px 80px',
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(255,107,157,0.12)',
          borderRadius: 50, padding: '6px 18px', marginBottom: 24,
          fontSize: '0.85rem', fontWeight: 700, color: 'var(--pink)',
          letterSpacing: 1,
        }}>
          💌 FOR LONG-DISTANCE HEARTS
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
          fontWeight: 900, lineHeight: 1.15,
          color: 'var(--plum)', marginBottom: 20, maxWidth: 640,
        }}>
          Because You Mean{' '}
          <span className="gradient-text">Everything</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
          color: 'var(--grey)', maxWidth: 480, lineHeight: 1.7,
          marginBottom: 40, fontWeight: 500,
        }}>
          Spin a dial. Hear their voice. Feel like they're right there with you —
          no matter how far apart you are.
        </p>

        <Link href="/create" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 48px' }}>
            Create Your Dial 🌸
          </button>
        </Link>

        {/* mini preview mockup */}
        <div style={{
          marginTop: 60,
          background: 'white',
          borderRadius: 28,
          padding: 24,
          boxShadow: '0 12px 48px rgba(255,107,157,0.18)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          width: 220,
        }}>
          <div style={{
            width: 120, height: 120, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--card-pink), var(--card-lav))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.8rem',
          }}>📸</div>
          <div style={{
            width: 8, height: 70,
            background: 'linear-gradient(180deg, var(--pink), var(--peach))',
            borderRadius: 8,
            boxShadow: '0 2px 10px rgba(255,107,157,0.4)',
            transform: 'rotate(20deg)',
          }}/>
          <p style={{ fontSize: '0.75rem', color: 'var(--grey)', fontWeight: 600 }}>Spin to hear 🎙</p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '80px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(199,125,255,0.12)',
          borderRadius: 50, padding: '6px 18px', marginBottom: 16,
          fontSize: '0.85rem', fontWeight: 700, color: 'var(--lavender)',
          letterSpacing: 1,
        }}>
          ✨ HOW IT WORKS
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, marginBottom: 48, textAlign: 'center' }}>
          Three steps to <span className="gradient-text">send love</span>
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24, maxWidth: 900, width: '100%',
        }}>
          {[
            { bg: 'var(--card-pink)', icon: '📸', step: '01', title: 'Upload Photos', desc: 'Add up to 10 photos of your favourite moments together.' },
            { bg: 'var(--card-lav)',  icon: '🎙️', step: '02', title: 'Record Your Voice', desc: 'Spin the handle and talk. Your voice syncs to every turn.' },
            { bg: 'var(--card-teal)', icon: '💌', step: '03', title: 'Share the Link', desc: 'Send a tiny link. They spin — and feel you right there with them.' },
          ].map(c => (
            <div key={c.step} className="hiw-card" style={{
              background: c.bg, borderRadius: 24, padding: 32,
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--grey)', marginBottom: 8, letterSpacing: 2 }}>STEP {c.step}</div>
              <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>{c.icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 8 }}>{c.title}</h3>
              <p style={{ color: 'var(--grey)', lineHeight: 1.6, fontSize: '0.95rem' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feel section ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '60px 24px 100px',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,157,0.1), rgba(255,179,71,0.1))',
          border: '2px solid rgba(255,107,157,0.2)',
          borderRadius: 28, padding: '48px 40px', maxWidth: 560,
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>💞</div>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', marginBottom: 14 }}>
            Distance is just a number.
          </h2>
          <p style={{ color: 'var(--grey)', lineHeight: 1.7, marginBottom: 28, fontSize: '0.95rem' }}>
            Your voice, your photos, your love — spinning in their hands.<br/>
            HeartDial makes 10,000 km feel like one heartbeat.
          </p>
          <Link href="/create" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">Start Creating 💕</button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        background: 'var(--plum)', color: 'rgba(255,255,255,0.7)',
        padding: '32px 24px', textAlign: 'center', fontSize: '0.88rem',
        position: 'relative', zIndex: 1,
      }}>
        <span style={{ fontWeight: 800, color: 'var(--pink)' }}>❤ HeartDial</span>
        {'  ·  '}Made with love for long-distance hearts{'  ·  '}
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Dials expire after 30 days</span>
      </footer>
    </div>
  );
}
