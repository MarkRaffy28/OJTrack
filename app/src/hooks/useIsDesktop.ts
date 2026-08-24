import { useWindowDimensions } from "react-native";
import { DESKTOP_BREAKPOINT } from "@/constants/responsive.constant";

export function useIsDesktop() {
  const { width } = useWindowDimensions();

  return width >= DESKTOP_BREAKPOINT;
}
