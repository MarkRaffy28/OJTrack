import { USER_AGE } from "@/constants/user.constants";

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
 * Returns YYYY-MM-DD
 */
export const formatDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function getBirthDateRange() {
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
}
