import React, { useState, useRef, useCallback, MouseEvent, TouchEvent } from "react";
import { IonIcon } from "@ionic/react";
import { closeCircleOutline, downloadOutline } from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import ServerImage from "./ServerImage";
import "@css/Lightbox.css";

interface LightboxProps {
  src: string;
  onClose: () => void;
  alt?: string;
}

function Lightbox({ src, onClose, alt = "attachment" }: LightboxProps) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastDist, setLastDist] = useState(0);
  const lastTapRef = useRef<number>(0);

  const handleClose = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });

      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (scale > 1) {
          setScale(1);
          setPos({ x: 0, y: 0 });
        } else {
          setScale(2.5);
        }
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

  const onTouchMove = (e: React.TouchEvent) => {
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

  const onWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY * -0.01;
    setScale((s) => Math.max(1, Math.min(5, s + delta)));
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (Capacitor.isNativePlatform()) {
      let shareUrl = src;
      try {
        const response = await fetch(src, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64.split(",")[1]);
            };
            reader.readAsDataURL(blob);
          });

          const extension = src.split(".").pop()?.split("?")[0] || "jpg";
          const fileName = `attachment_${Date.now()}.${extension}`;

          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
          });
          shareUrl = savedFile.uri;
        }
      } catch (err) {
        console.error(
          "File preparation failed, falling back to URL sharing:",
          err,
        );
      }

      try {
        await Share.share({
          title: alt || "Attachment",
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
      return;
    }

    const link = document.createElement("a");
    link.href = src;
    link.download = alt || "attachment";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="lb-overlay"
      style={{ touchAction: "none" }}
      onClick={handleClose}
      onWheel={onWheel}
    >
      <div className="lb-header" onClick={(e) => e.stopPropagation()}>
        <button
          className="lb-action-btn"
          onClick={handleDownload}
          title="Download"
        >
          <IonIcon icon={downloadOutline} />
        </button>
        <button className="lb-close-btn" onClick={onClose} title="Close">
          <IonIcon icon={closeCircleOutline} />
        </button>
      </div>

      <div
        className="lb-body"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => setLastDist(0)}
      >
        <ServerImage
          src={src}
          alt={alt}
          className="lb-img"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: lastDist > 0 ? "none" : "transform 0.1s ease-out",
            touchAction: "none",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="lb-hint">
        {scale > 1
          ? "Drag to pan · Pinch to zoom out"
          : "Pinch or double tap to zoom"}
      </div>
    </div>
  );
}

export default Lightbox;
