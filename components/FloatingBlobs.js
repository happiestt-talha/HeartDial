'use client';

export default function FloatingBlobs() {
  const decos = [
    { ch: '★', top: '18%', left: '8%', color: 'var(--pink)', size: 22, delay: 0 },
    { ch: '♡', top: '35%', left: '5%', color: 'var(--lavender)', size: 18, delay: 0.8 },
    { ch: '★', top: '60%', left: '9%', color: 'var(--peach)', size: 14, delay: 1.5 },
    { ch: '♡', top: '80%', left: '6%', color: 'var(--teal)', size: 20, delay: 0.4 },
    { ch: '★', top: '22%', right: '7%', color: 'var(--peach)', size: 16, delay: 1.1 },
    { ch: '♡', top: '45%', right: '5%', color: 'var(--pink)', size: 22, delay: 0.2 },
    { ch: '★', top: '68%', right: '8%', color: 'var(--lavender)', size: 14, delay: 1.8 },
    { ch: '♡', top: '88%', right: '6%', color: 'var(--green)', size: 18, delay: 0.6 },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* blobs */}
      <div className="blob" style={{
        position: 'absolute', top: '-60px', left: '-80px',
        width: 320, height: 320, borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
        background: 'rgba(255,107,157,0.12)', filter: 'blur(2px)',
      }}/>
      <div className="blob2" style={{
        position: 'absolute', bottom: '5%', right: '-60px',
        width: 280, height: 280, borderRadius: '40% 60% 30% 70% / 60% 40% 70% 30%',
        background: 'rgba(78,205,196,0.12)', filter: 'blur(2px)',
      }}/>
      <div className="blob3" style={{
        position: 'absolute', top: '40%', left: '-40px',
        width: 200, height: 200, borderRadius: '70% 30% 50% 50% / 30% 70% 50% 50%',
        background: 'rgba(199,125,255,0.1)', filter: 'blur(2px)',
      }}/>
      <div className="blob4" style={{
        position: 'absolute', top: '20%', right: '2%',
        width: 180, height: 180, borderRadius: '50% 50% 30% 70% / 70% 30% 60% 40%',
        background: 'rgba(107,203,119,0.1)', filter: 'blur(2px)',
      }}/>

      {/* stars & hearts */}
      {decos.map((d, i) => (
        <span key={i} className="deco" style={{
          position: 'absolute',
          top: d.top, left: d.left, right: d.right,
          color: d.color, fontSize: d.size,
          animationDelay: `${d.delay}s`,
        }}>{d.ch}</span>
      ))}
    </div>
  );
}
