export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const getInitials = (text: string, limit = 2) =>
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, limit)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
