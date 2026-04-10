import React, { useEffect, useState } from 'react';

interface ServerImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: React.ReactNode;
}

function ServerImage({ src, alt, fallback = null, ...props }: ServerImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    setFailed(false);
    setBlobUrl(null);

    fetch(src, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (failed) return <>{fallback}</>;
  if (!blobUrl) return <>{fallback}</>;

  return <img src={blobUrl} alt={alt} {...props} />;
}

export default ServerImage;
