/**
 * Returns countdown in MM:SS format
 */
export const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Format HH:mm time string into a human-readable format (e.g., "2:30 PM").
 * Returns empty string if value is invalid or undefined.
 */
export function formatNamedTime(value: unknown): string {
  if (typeof value !== "string" || !value) {
    return "";
  }

  const parts = value.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return "";
  }

  const h = hours % 12 || 12;
  const period = hours < 12 ? "AM" : "PM";
  const m = String(minutes).padStart(2, "0");

  return `${h}:${m} ${period}`;
}

/**
 * Format hours and minutes into HH:mm string.
 * Returns string in HH:mm format
 */
export function formatTimeOnly(hours: number, minutes: number): string {
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  return `${h}:${m}`;
}