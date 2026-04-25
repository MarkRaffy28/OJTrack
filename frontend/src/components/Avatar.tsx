import React, { MouseEvent, TouchEvent, WheelEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { initials } from "@utils/string";
import "@css/Avatar.css";

interface AvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  clickable?: boolean;
}

function Avatar({
  src,
  name = "User",
  className = "sv-detail-avatar",
  style,
  clickable = true,
}: AvatarProps) {
  const [open, setOpen] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastDist, setLastDist] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const lastTapRef = useRef(0);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
    setLastDist(0);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setCanClose(false);
        resetZoom();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, resetZoom]);

  const handleOpen = (e: MouseEvent) => {
    if (!clickable || !src) return;
    e.preventDefault();
    e.stopPropagation();
    resetZoom();
    setOpen(true);
    setTimeout(() => setCanClose(true), 220);
  };

  const handleClose = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!canClose) return;
    setOpen(false);
    setCanClose(false);
    resetZoom();
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (scale !== 1) resetZoom();
        else setScale(2.5);
      }
      lastTapRef.current = now;
    } else if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      setLastDist(d);
    }
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) e.preventDefault();
    if (e.touches.length === 1 && scale > 1) {
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (lastDist > 0) {
        const ratio = d / lastDist;
        setScale((s) => Math.max(1, Math.min(5, s * ratio)));
      }
      setLastDist(d);
    }
  };

  const onWheel = (e: WheelEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((s) => Math.min(5, Math.max(1, s + delta)));
  };

  const onMouseDown = (e: MouseEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const onMouseMove = (e: MouseEvent<HTMLImageElement>) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const stopDrag = () => setIsDragging(false);

  return (
    <>
      <div
        className={className}
        style={{
          cursor: src && clickable ? "pointer" : "default",
          overflow: "hidden",
          position: "relative",
          ...style,
        }}
        onClick={handleOpen}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "inherit",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "calc(var(--avatar-size, 40px) * 0.4)",
              fontFamily: "Syne, sans-serif",
              textTransform: "uppercase",
              aspectRatio: "1 / 1",
            }}
          >
            {initials(name)}
          </div>
        )}
      </div>

      {open &&
        createPortal(
          <div
            className="av-overlay"
            onClick={handleClose}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => setLastDist(0)}
          >
            <button
              type="button"
              className="av-overlay-close"
              onClick={handleClose}
            >
              ×
            </button>
            <img
              src={src ?? ""}
              alt={name}
              className="av-overlay-img"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transition:
                  isDragging || lastDist > 0
                    ? "none"
                    : "transform 0.12s ease-out",
                cursor:
                  scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              }}
              onClick={(e) => e.stopPropagation()}
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={stopDrag}
              onMouseLeave={stopDrag}
              draggable={false}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

export default Avatar;
