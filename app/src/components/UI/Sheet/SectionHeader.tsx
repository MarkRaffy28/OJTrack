import { View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

import { useTheme } from "@/store/settings.store";
import { useSheetStyles } from "./styles";

type Props = {
  title: string;
  icon: IconSource;
};

export function SheetSectionHeader({ title, icon }: Props) {
  const theme = useTheme();
  const styles = useSheetStyles();

  return (
    <View style={styles.sectionHeader.container}>
      <Icon
        source={icon}
        size={theme.fonts.titleMedium.fontSize}
        color={theme.colors.onSurfaceVariant}
      />

      <Text variant="titleMedium" style={styles.sectionHeader.title}>
        {title}
      </Text>
    </View>
  );
}

SheetSectionHeader.displayName = "SheetSectionHeader";
