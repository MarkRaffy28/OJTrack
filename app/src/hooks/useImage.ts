import { useCallback, useState } from "react";

export function useImage() {
  const [image, setImage] = useState<string | null>(null);

  const clearImage = useCallback(() => {
    setImage(null);
  }, []);

  return {
    image,
    setImage,
    clearImage,
  };
}
