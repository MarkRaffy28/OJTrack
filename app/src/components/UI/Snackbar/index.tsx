import { Text, View } from "react-native";
import {
  Icon,
  Portal,
  Snackbar as PaperSnackbar,
  SnackbarProps as PaperSnackbarProps,
} from "react-native-paper";
import { useSnackbarStyles } from "./styles";

export interface Props extends Omit<PaperSnackbarProps, "children"> {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export function Snackbar({
  type = "success",
  message,
  duration = 3000,
  contentStyle,
  ...props
}: Props) {
  const styles = useSnackbarStyles();

  const icon = {
    success: "check-circle",
    error: "alert-circle",
    warning: "alert",
    info: "information",
  };

  return (
    <Portal>
      <PaperSnackbar
        duration={duration}
        style={styles.container(type)}
        contentStyle={[styles.content(type), contentStyle]}
        {...props}
      >
        <View style={styles.innerContainer}>
          <Icon source={icon[type]} size={20} color={styles.iconColor(type)} />

          <Text style={styles.children(type)}>{message}</Text>
        </View>
      </PaperSnackbar>
    </Portal>
  );
}

Snackbar.displayName = "Snackbar";
