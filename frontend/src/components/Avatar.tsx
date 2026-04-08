import React, { useState } from 'react';
import { initials } from '@utils/string';

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

function Avatar({ src, name, className = 'sv-detail-avatar', style }: AvatarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={className}
        style={{ cursor: src ? 'pointer' : 'default', overflow: 'hidden', position: 'relative', ...style }}
        onClick={() => src && setOpen(true)}
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
        <div className="av-overlay" onClick={() => setOpen(false)}>
          <button className="av-overlay-close" onClick={() => setOpen(false)}>✕</button>
          <img
            src={src!}
            alt={name}
            className="av-overlay-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default Avatar;
