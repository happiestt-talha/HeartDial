'use client';
import { useRef } from 'react';

export default function PhotoUpload({ photos, setPhotos }) {
  const inputRef = useRef(null);

  const addFiles = (files) => {
    const remaining = 10 - photos.length;
    const newFiles = Array.from(files).slice(0, remaining);
    const readers = newFiles.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve({ file, preview: e.target.result });
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(items => setPhotos(prev => [...prev, ...items]));
  };

  const onDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const remove = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          border: '2.5px dashed var(--pink)',
          borderRadius: 20, padding: 32,
          textAlign: 'center', cursor: 'pointer',
          background: 'rgba(255,107,157,0.04)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,157,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,157,0.04)'}
      >
        <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🖼️</div>
        <p style={{ fontWeight: 700, color: 'var(--plum)' }}>
          Drop photos here or <span style={{ color: 'var(--pink)' }}>click to browse</span>
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--grey)', marginTop: 4 }}>
          {photos.length}/10 photos • JPG, PNG, WEBP
        </p>
      </div>
      <input
        ref={inputRef} type="file" accept="image/*" multiple hidden
        onChange={e => addFiles(e.target.files)}
      />

      {/* Thumbnails */}
      {photos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {photos.map((p, i) => (
            <div key={i} className="photo-thumb">
              <img src={p.preview} alt={`photo ${i + 1}`}/>
              <button className="remove-btn" onClick={() => remove(i)}>×</button>
              <div style={{
                position: 'absolute', bottom: 3, left: 3,
                background: 'rgba(61,44,62,0.7)',
                borderRadius: 4, padding: '1px 5px',
                fontSize: '0.65rem', color: 'white', fontWeight: 700,
              }}>
                {Math.round((i / photos.length) * 360)}°
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
