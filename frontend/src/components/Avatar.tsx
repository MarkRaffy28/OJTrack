import React, { useState, useCallback, useRef, MouseEvent, TouchEvent } from 'react';
import { initials } from '@utils/string';

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  style?: React.CSSProperties;
  clickable?: boolean;
}

function Avatar({ src, name, className = 'sv-detail-avatar', style, clickable = true }: AvatarProps) {
  const [open, setOpen] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastDist, setLastDist] = useState(0);
  const lastTapRef = useRef<number>(0);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const handleOpen = (e: MouseEvent) => {
    if (!clickable) return;
    if (src) {
      e.stopPropagation();
      resetZoom();
      setOpen(true);
      setTimeout(() => setCanClose(true), 300);
    }
  };

  const handleClose = (e?: MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canClose) return;
    
    setOpen(false);
    setCanClose(false);
    resetZoom();
  };

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      
      // Double tap to zoom
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (scale !== 1) resetZoom();
        else setScale(2.5);
      }
      lastTapRef.current = now;
    } else if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastDist(d);
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) e.preventDefault();
    if (e.touches.length === 1 && scale > 1) {
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;
      setPos(p => ({ x: p.x + dx, y: p.y + dy }));
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDist > 0) {
        const ratio = d / lastDist;
        setScale(s => Math.max(1, Math.min(5, s * ratio)));
      }
      setLastDist(d);
    }
  };

  return (
    <>
      <div
        className={className}
        style={{ cursor: (src && clickable) ? 'pointer' : 'default', overflow: 'hidden', position: 'relative', ...style }}
        onClick={handleOpen}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
          />
        ) : (
          initials(name)
        )}
      </div>

      {open && (
        <div 
          className="av-overlay" 
          onClick={handleClose}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => setLastDist(0)}
        >
          <button className="av-overlay-close" onClick={handleClose}>✕</button>
          <img
            src={src!}
            alt={name}
            className="av-overlay-img"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transition: lastDist > 0 ? 'none' : 'transform 0.1s ease-out',
            }}
            onClick={e => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}
    </>
  );
}

export default Avatar;

