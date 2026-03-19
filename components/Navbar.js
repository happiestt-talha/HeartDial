'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{
      position: 'fixed', top: 16, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderRadius: '50px',
      padding: '10px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 32,
      boxShadow: '0 4px 24px rgba(255,107,157,0.18)',
      border: '1px solid rgba(255,107,157,0.15)',
      minWidth: 320,
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>
          <span className="gradient-text">❤ HeartDial</span>
        </span>
      </Link>
      <Link href="/create">
        <button className="btn-primary" style={{ padding: '8px 22px', fontSize: '0.9rem' }}>
          Create Dial ✨
        </button>
      </Link>
    </nav>
  );
}
