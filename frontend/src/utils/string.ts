export const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
export const initials = (string: string) => string.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
