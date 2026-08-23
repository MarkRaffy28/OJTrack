import { ReactNode } from "react";
import { Text } from "react-native-paper";
import { useSheetStyles } from "./styles";

export function SheetTitle({ children }: { children: ReactNode }) {
  const styles = useSheetStyles();

  return (
    <Text variant="titleLarge" style={styles.title}>
      {children}
    </Text>
  );
}

SheetTitle.displayName = "SheetTitle";