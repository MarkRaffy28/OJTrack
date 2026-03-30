import { useState, useEffect } from "react";

type OjtData = {
  requiredHours?: number;
  renderedHours?: number;
};

export function useOjtProgress(currentOjt?: OjtData | null) {
  const [requiredHours, setRequiredHours] = useState<number>(0);
  const [renderedHours, setRenderedHours] = useState<number>(0);

  useEffect(() => {
    setRequiredHours(Math.round(currentOjt?.requiredHours ?? 0));
    setRenderedHours(Math.round(currentOjt?.renderedHours ?? 0));
  }, [currentOjt]);

  const remainingHours = requiredHours - renderedHours;

  const progressPercentage =
    requiredHours === 0
      ? 0
      : Math.min((renderedHours / requiredHours) * 100, 100);

  return {
    requiredHours,
    renderedHours,
    remainingHours,
    progressPercentage,
  };
}