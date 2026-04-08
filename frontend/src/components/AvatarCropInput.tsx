import React, { useState, useRef, useCallback } from 'react';
import { IonIcon } from '@ionic/react';
import { cameraOutline, trashOutline, closeOutline, checkmarkOutline } from 'ionicons/icons';

const CROP_SIZE = 280;

interface CropState {
  x: number;
  y: number;
  scale: number;
}

interface AvatarCropInputProps {
  value: string | null;
  onChange: (photo: string | null) => void;
}

function AvatarCropInput({ value, onChange }: AvatarCropInputProps) {
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropping,  setIsCropping]  = useState(false);
  const [cropState,   setCropState]   = useState<CropState>({ x: 0, y: 0, scale: 1 });
  const [isDragging,  setIsDragging]  = useState(false);

  const dragStart    = useRef<{ mx: number; my: number; cx: number; cy: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropImgRef   = useRef<HTMLImageElement>(null);

  // ── File pick ────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setRawImageSrc(ev.target?.result as string);
      setCropState({ x: 0, y: 0, scale: 1 });
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Center image once natural dimensions are known ───────────────────────
  const handleImageLoad = useCallback(() => {
    const img = cropImgRef.current;
    if (!img) return;
    // Cover-fit scale: image fills the crop square on the shorter axis
    const scale = Math.max(
      CROP_SIZE / img.naturalWidth,
      CROP_SIZE / img.naturalHeight,
    );
    // Center the scaled image within the viewport
    const x = (CROP_SIZE - img.naturalWidth  * scale) / 2;
    const y = (CROP_SIZE - img.naturalHeight * scale) / 2;
    setCropState({ x, y, scale });
  }, []);

  // ── Drag ─────────────────────────────────────────────────────────────────
  const onDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { mx: clientX, my: clientY, cx: cropState.x, cy: cropState.y };
  }, [cropState]);

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !dragStart.current) return;
    const dx = clientX - dragStart.current.mx;
    const dy = clientY - dragStart.current.my;
    setCropState(prev => ({
      ...prev,
      x: dragStart.current!.cx + dx,
      y: dragStart.current!.cy + dy,
    }));
  }, [isDragging]);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // ── Apply crop ───────────────────────────────────────────────────────────
  const applyCrop = useCallback(() => {
    const img = cropImgRef.current;
    if (!img || !rawImageSrc) return;

    const canvas = document.createElement('canvas');
    const OUTPUT = 400;
    canvas.width = canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d')!;

    // Image top-left is at (x, y) in viewport space, scaled by `scale`.
    // To find what part of the natural image covers the viewport [0..CROP_SIZE]:
    //   viewport point (vx, vy) → natural image point ((vx - x) / scale, (vy - y) / scale)
    // So viewport (0, 0) → natural (-x / scale, -y / scale)
    const srcX = -cropState.x / cropState.scale;
    const srcY = -cropState.y / cropState.scale;
    const srcW =  CROP_SIZE   / cropState.scale;
    const srcH =  CROP_SIZE   / cropState.scale;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT, OUTPUT);

    onChange(canvas.toDataURL('image/jpeg', 0.92));
    setIsCropping(false);
    setRawImageSrc(null);
  }, [rawImageSrc, cropState, onChange]);

  const cancelCrop = () => {
    setIsCropping(false);
    setRawImageSrc(null);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* ── Avatar with camera button ── */}
      <div className="ea-hero-avatar-area">
        <div className="ea-avatar-wrap">
          {value ? (
            <div className="ea-avatar ea-avatar--photo">
              <img src={value} alt="Profile" />
            </div>
          ) : (
            <div className="ea-avatar">
              <IonIcon icon={cameraOutline} />
            </div>
          )}
          <button
            type="button"
            className="ea-avatar-cam"
            onClick={() => fileInputRef.current?.click()}
          >
            <IonIcon icon={cameraOutline} />
          </button>
        </div>

        {value && (
          <button
            type="button"
            className="ea-remove-photo"
            onClick={() => onChange(null)}
          >
            <IonIcon icon={trashOutline} /> Remove photo
          </button>
        )}
      </div>

      {/* ── Crop overlay ── */}
      {isCropping && rawImageSrc && (
        <div className="ea-cropper-overlay">
          <div className="ea-cropper-modal">

            <div className="ea-cropper-header">
              <div className="ea-cropper-title-group">
                <div className="ea-cropper-icon-badge">
                  <IonIcon icon={cameraOutline} />
                </div>
                <div>
                  <div className="ea-cropper-title">Adjust your photo</div>
                  <div className="ea-cropper-subtitle">Drag · Scroll or slide to zoom</div>
                </div>
              </div>
              <button type="button" className="ea-cropper-close" onClick={cancelCrop}>
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            <div className="ea-cropper-viewport-wrap">
              <div
                className="ea-cropper-viewport"
                style={{ width: CROP_SIZE, height: CROP_SIZE, position: 'relative', overflow: 'hidden' }}
                onMouseDown={e  => onDragStart(e.clientX, e.clientY)}
                onMouseMove={e  => { if (isDragging) onDragMove(e.clientX, e.clientY); }}
                onMouseUp={onDragEnd}
                onMouseLeave={onDragEnd}
                onTouchStart={e => { const t = e.touches[0]; onDragStart(t.clientX, t.clientY); }}
                onTouchMove={e  => { const t = e.touches[0]; onDragMove(t.clientX, t.clientY); }}
                onTouchEnd={onDragEnd}
                onWheel={e => {
                  e.preventDefault();
                  setCropState(prev => {
                    const newScale = Math.max(0.5, Math.min(4, prev.scale - e.deltaY * 0.001));
                    const ratio = newScale / prev.scale;
                    const cx = CROP_SIZE / 2;
                    const cy = CROP_SIZE / 2;
                    return {
                      scale: newScale,
                      x: cx - ratio * (cx - prev.x),
                      y: cy - ratio * (cy - prev.y),
                    };
                  });
                }}
              >
                <img
                  ref={cropImgRef}
                  src={rawImageSrc}
                  alt="crop"
                  draggable={false}
                  onLoad={handleImageLoad}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    // Size the image by its natural dimensions × scale,
                    // then translate so top-left sits at (x, y).
                    // This means cropState.x/y is literally the top-left corner
                    // of the image in viewport space — exactly what the canvas math uses.
                    width:  cropImgRef.current ? cropImgRef.current.naturalWidth  * cropState.scale : undefined,
                    height: cropImgRef.current ? cropImgRef.current.naturalHeight * cropState.scale : undefined,
                    transform: `translate(${cropState.x}px, ${cropState.y}px)`,
                    transformOrigin: 'top left',
                    maxWidth: 'none',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
                <div className="ea-cropper-mask" />
                <div className="ea-cropper-ring" />
              </div>
            </div>

            <div className="ea-cropper-zoom-row">
              <span className="ea-cropper-zoom-label">–</span>
              <input
                type="range" min="0.5" max="4" step="0.01"
                value={cropState.scale}
                onChange={e => {
                  const newScale = parseFloat(e.target.value);
                  setCropState(prev => {
                    const ratio = newScale / prev.scale;
                    const cx = CROP_SIZE / 2;
                    const cy = CROP_SIZE / 2;
                    return {
                      scale: newScale,
                      x: cx - ratio * (cx - prev.x),
                      y: cy - ratio * (cy - prev.y),
                    };
                  });
                }}
                className="ea-cropper-slider"
              />
              <span className="ea-cropper-zoom-label">+</span>
            </div>

            <div className="ea-cropper-actions">
              <button type="button" className="ea-cropper-btn ea-cropper-btn--cancel" onClick={cancelCrop}>
                Cancel
              </button>
              <button type="button" className="ea-cropper-btn ea-cropper-btn--apply" onClick={applyCrop}>
                <IonIcon icon={checkmarkOutline} /> Apply Crop
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AvatarCropInput;