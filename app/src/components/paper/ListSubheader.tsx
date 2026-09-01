import type { ComponentProps } from "react";
import { List } from "react-native-paper";

import { useAppStyles } from "@/styles/app.styles";

export function ListSubheader({
  style,
  ...props
}: ComponentProps<typeof List.Subheader>) {
  const styles = useAppStyles();

  return <List.Subheader {...props} style={[styles.list.subheader.container, style]} />;
}
