import { DARK_SHADE, LIGHT_SHADE, MATERIAL_COLORS } from "@/constants/colors.constants";
import { useSettingsStore } from "@/store/settings.store";
import { MaterialColorName, Shade } from "@/types/color.types";

export const getMaterialColor = (
  color: MaterialColorName,
  {
    lightShade = LIGHT_SHADE,
    darkShade = DARK_SHADE,
  }: {
    lightShade?: Shade;
    darkShade?: Shade;
  } = {},
): string => {
  const isDark = useSettingsStore.getState().mode === "dark";

  return MATERIAL_COLORS[color][isDark ? darkShade : lightShade];
};
