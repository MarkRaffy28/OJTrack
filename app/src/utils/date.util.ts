import { USER_AGE } from "@/constants/user.constants";

const parseDateOnly = (date: string | Date): Date => {
  if (date instanceof Date) return date;

  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const formatDay = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
  });
};

/**
 * Returns January 1, 1970
 */
export const formatNamedDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Returns Today, Yesterday, or Saturday, January 1, 1970
 */
export const formatRelativeDate = (date: Date): string => {
  const target = parseDateOnly(date);
  const now = new Date();

  if (isSameDate(target, now)) {
    return "Today";
  }

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  if (isSameDate(target, yesterday)) {
    return "Yesterday";
  }

  return target.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Returns YYYY-MM-DD
 */
export const formatDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Returns the academic year options.
 *
 * Format: ["2025-2026", "2026-2027", "2027-2028"]
 */
export const getAcademicYearOptions = (startYear = 2023) => {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
    const year = startYear + index;

    return {
      label: `${year}-${year + 1}`,
      value: `${year}-${year + 1}`,
    };
  });
};

/**
 * Returns the minimum and maximum birth date range based on the user's age.
 */
export const getBirthDateRange = () => {
  const today = new Date();

  return {
    startDate: new Date(
      today.getFullYear() - USER_AGE.MAX,
      today.getMonth(),
      today.getDate(),
    ),
    endDate: new Date(
      today.getFullYear() - USER_AGE.MIN,
      today.getMonth(),
      today.getDate(),
    ),
  };
};

/**
 * Returns a greeting based on the time of day.
 */
export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good Morning";
  else if (hour >= 12 && hour < 18) return "Good Afternoon";
  else if (hour >= 18 && hour < 22) return "Good Evening";
  else return "Good Night";
};

/**
 * Returns a date range for the past 50 years including today.
 */
export const getPastDateRange = () => {
  const today = new Date();

  return {
    startDate: new Date(today.getFullYear() - 50, today.getMonth(), today.getDate()),
    endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  };
};
