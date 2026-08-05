import { ReactNode } from "react";
import { View } from "react-native";

import { useAppStyles } from "@/styles/app.styles";

type Props = {
  children: ReactNode;
}

export function AppView({ children }: Props) {
  const styles = useAppStyles();

  return (
    <View style={styles.appView}>
      {children}
    </View>
  );
}