import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IonIcon } from '@ionic/react';
import { cameraOutline, trashOutline, closeOutline, checkmarkOutline } from 'ionicons/icons';
import Avatar from './Avatar';
import '@css/AvatarCropInput.css';

const CROP_SIZE = 248;

interface CropState { x: number; y: number; scale: number; }

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
  const viewportRef  = useRef<HTMLDivElement>(null);
  const lastTouchDist = useRef<number>(0);

  useEffect(() => {
    if (!isCropping) return;
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setCropState(prev => {
        const newScale = Math.max(0.5, Math.min(4, prev.scale - e.deltaY * 0.001));
        const ratio    = newScale / prev.scale;
        const cx = CROP_SIZE / 2;
        const cy = CROP_SIZE / 2;
        return { scale: newScale, x: cx - ratio * (cx - prev.x), y: cy - ratio * (cy - prev.y) };
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [isCropping]);

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

  const handleImageLoad = useCallback(() => {
    const img = cropImgRef.current;
    if (!img) return;
    const scale = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
    const x = (CROP_SIZE - img.naturalWidth  * scale) / 2;
    const y = (CROP_SIZE - img.naturalHeight * scale) / 2;
    setCropState({ x, y, scale });
  }, []);

  const onDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { mx: clientX, my: clientY, cx: cropState.x, cy: cropState.y };
  }, [cropState]);

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !dragStart.current) return;
    const start = dragStart.current;
    const dx = clientX - start.mx;
    const dy = clientY - start.my;
    setCropState(prev => ({ ...prev, x: start.cx + dx, y: start.cy + dy }));
  }, [isDragging]);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  const applyCrop = useCallback(() => {
    const img = cropImgRef.current;
    if (!img || !rawImageSrc) return;
    const canvas = document.createElement('canvas');
    const OUTPUT = 400;
    canvas.width = canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d')!;
    const srcX = -cropState.x / cropState.scale;
    const srcY = -cropState.y / cropState.scale;
    const srcW =  CROP_SIZE   / cropState.scale;
    const srcH =  CROP_SIZE   / cropState.scale;
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT, OUTPUT);
    onChange(canvas.toDataURL('image/jpeg', 0.92));
    setIsCropping(false);
    setRawImageSrc(null);
  }, [rawImageSrc, cropState, onChange]);

  const cancelCrop = () => { setIsCropping(false); setRawImageSrc(null); };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="ea-hidden-file-input"
        onChange={handleFileChange}
      />

      <div className="ea-hero-avatar-area">
        <div className="ea-avatar-wrap">
          {value ? (
            <Avatar 
              src={value} 
              name="Profile" 
              className="ea-avatar ea-avatar--photo" 
            />
          ) : (
            <div className="ea-avatar">
              <IonIcon icon={cameraOutline} />
            </div>
          )}
          <button type="button" className="ea-avatar-cam" onClick={() => fileInputRef.current?.click()}>
            <IonIcon icon={cameraOutline} />
          </button>
        </div>
        {value && (
          <button type="button" className="ea-remove-photo" onClick={() => onChange(null)}>
            <IonIcon icon={trashOutline} /> Remove photo
          </button>
        )}
      </div>

      {isCropping && rawImageSrc && createPortal(
        <div className="ea-cropper-overlay">
          <div className="ea-cropper-modal">
            <div className="ea-cropper-header">
              <div className="ea-cropper-title-group">
                <div className="ea-cropper-icon-badge">
                  <IonIcon icon={cameraOutline} />
                </div>
                <div>
                  <div className="ea-cropper-title">Adjust your photo</div>
                  <div className="ea-cropper-subtitle">Drag · Pinch or slide to zoom</div>
                </div>
              </div>
              <button type="button" className="ea-cropper-close" onClick={cancelCrop}>
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            <div className="ea-cropper-viewport-container">
              <div
                ref={viewportRef}
                className="ea-cropper-viewport"
                style={{
                  width: CROP_SIZE,
                  height: CROP_SIZE,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  '--crop-size': `${CROP_SIZE}px`
                } as React.CSSProperties}
                onMouseDown={e  => onDragStart(e.clientX, e.clientY)}
                onMouseMove={e  => { if (isDragging) onDragMove(e.clientX, e.clientY); }}
                onMouseUp={onDragEnd}
                onMouseLeave={onDragEnd}
                onTouchStart={e => {
                  e.preventDefault();
                  if (e.touches.length === 1) {
                    const t = e.touches[0];
                    onDragStart(t.clientX, t.clientY);
                  } else if (e.touches.length === 2) {
                    const d = Math.hypot(
                      e.touches[0].clientX - e.touches[1].clientX,
                      e.touches[0].clientY - e.touches[1].clientY
                    );
                    lastTouchDist.current = d;
                  }
                }}
                onTouchMove={e => {
                  e.preventDefault();
                  if (e.touches.length === 1) {
                    const t = e.touches[0];
                    onDragMove(t.clientX, t.clientY);
                  } else if (e.touches.length === 2) {
                    const d = Math.hypot(
                      e.touches[0].clientX - e.touches[1].clientX,
                      e.touches[0].clientY - e.touches[1].clientY
                    );
                    const lastD = lastTouchDist.current || d;
                    const ratio = d / lastD;
                    setCropState(prev => {
                      const newScale = Math.max(0.5, Math.min(4, prev.scale * ratio));
                      const scaleRatio = newScale / prev.scale;
                      const cx = CROP_SIZE / 2;
                      const cy = CROP_SIZE / 2;
                      return {
                        scale: newScale,
                        x: cx - scaleRatio * (cx - prev.x),
                        y: cy - scaleRatio * (cy - prev.y)
                      };
                    });
                    lastTouchDist.current = d;
                  }
                }}
                onTouchEnd={() => {
                  onDragEnd();
                  lastTouchDist.current = 0;
                }}
              >
                <img
                  ref={cropImgRef}
                  src={rawImageSrc}
                  alt="crop"
                  draggable={false}
                  onLoad={handleImageLoad}
                  className="ea-cropper-image"
                  style={{
                    width:  cropImgRef.current ? cropImgRef.current.naturalWidth  * cropState.scale : undefined,
                    height: cropImgRef.current ? cropImgRef.current.naturalHeight * cropState.scale : undefined,
                    transform: `translate(${cropState.x}px, ${cropState.y}px)`,
                  }}
                />
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
                    return { scale: newScale, x: cx - ratio * (cx - prev.x), y: cy - ratio * (cy - prev.y) };
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
        </div>,
        document.body
      )}
    </>
  );
}

export default AvatarCropInput;