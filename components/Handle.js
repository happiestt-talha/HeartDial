'use client';
import { useRef, useEffect, useCallback } from 'react';

/**
 * Handle — rotates around its center.
 * Props:
 *   angle          number   current rotation in degrees
 *   onAngleChange  fn(deg)  called on pointer drag
 *   isActive       bool     show pulse rings
 *   size           number   SVG width/height (default 200)
 */
export default function Handle({ angle = 0, onAngleChange, isActive = false, size = 200 }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const lastAngle = useRef(angle);

  const getAngle = useCallback((clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const pivotX = rect.left + rect.width / 2;
    const pivotY = rect.top + rect.height / 2;
    const dx = clientX - pivotX;
    const dy = clientY - pivotY;
    // 0° = UP, clockwise = positive
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const newAngle = getAngle(e.clientX, e.clientY);
    let delta = newAngle - lastAngle.current;
    if (delta >  180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngle.current = newAngle;
    onAngleChange?.(delta);
  }, [getAngle, onAngleChange]);

  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    lastAngle.current = getAngle(e.clientX, e.clientY);
    onAngleChange?.('start');
  }, [getAngle, onAngleChange]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    onAngleChange?.('stop');
  }, [onAngleChange]);

  const cx = size / 2;
  const cy = size / 2;
  const barW = size * 0.13;
  const barH = size * 0.58;

  return (
    <div style={{ position: 'relative', width: size, height: size, userSelect: 'none' }}>
      {/* Pulse rings */}
      {isActive && <>
        <div className="pulse-ring" style={{
          width: size * 0.32, height: size * 0.32,
          left: cx - size * 0.16, top: cy - size * 0.16,
          background: 'rgba(255,107,157,0.4)',
        }}/>
        <div className="pulse-ring pulse-ring-2" style={{
          width: size * 0.32, height: size * 0.32,
          left: cx - size * 0.16, top: cy - size * 0.16,
          background: 'rgba(255,179,71,0.3)',
        }}/>
      </>}

      <svg
        ref={svgRef}
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ cursor: 'grab', touchAction: 'none', display: 'block' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <defs>
          <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF6B9D"/>
            <stop offset="100%" stopColor="#FFB347"/>
          </linearGradient>
          <linearGradient id="pvg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3D2C3E"/>
            <stop offset="100%" stopColor="#6B3D7F"/>
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(255,107,157,0.35)"/>
          </filter>
        </defs>

        {/* rotating group */}
        <g transform={`rotate(${angle}, ${cx}, ${cy})`} filter="url(#shadow)">
          {/* bar */}
          <rect
            x={cx - barW / 2} y={cy - barH * 0.72}
            width={barW} height={barH}
            rx={barW / 2}
            fill="url(#hg)"
          />
          {/* grip ridges */}
          {[-10, 0, 10, 20].map(offset => (
            <rect
              key={offset}
              x={cx - barW / 2 + 3}
              y={cy + offset}
              width={barW - 6} height={3}
              rx={1.5}
              fill="rgba(255,255,255,0.25)"
            />
          ))}
          {/* shine overlay */}
          <rect
            x={cx - barW / 2} y={cy - barH * 0.72}
            width={barW * 0.45} height={barH}
            rx={barW / 2}
            fill="rgba(255,255,255,0.15)"
          />
          {/* knob at tip */}
          <circle cx={cx} cy={cy - barH * 0.72 + barW / 2} r={barW * 0.65} fill="rgba(255,255,255,0.3)"/>
        </g>

        {/* pivot circle (always on top, no rotation) */}
        <circle cx={cx} cy={cy} r={size * 0.12} fill="url(#pvg)"/>
        {/* bolt */}
        <circle cx={cx} cy={cy} r={size * 0.04} fill="rgba(255,255,255,0.5)"/>
      </svg>
    </div>
  );
}
