import { ReactNode } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";

import { capitalize } from "@/utils/string.util";
import { Dialog, type BaseDialogProps } from "./Dialog";
import { useDialogStyles } from "./styles";

interface Props extends BaseDialogProps {
  actionLabel?: ReactNode;
  destructive?: Boolean;
  onAction: () => void;
}

export function ConfirmDialog({
  visible,
  item,
  title,
  description,
  cancelLabel = "Cancel",
  actionLabel = "Confirm",
  destructive = false,
  loading = false,
  onCancel,
  onAction,
}: Props) {
  const styles = useDialogStyles();

  const defaultTitle = title ?? capitalize(item ?? "Confirm");

  const defaultDescription =
    description ??
    `Are you sure you want to ${item?.toLowerCase() ?? "continue"}?`;

  return (
    <Dialog
      visible={visible}
      title={defaultTitle}
      description={defaultDescription}
      onDismiss={onCancel}
      actions={
        <View style={styles.actions}>
          <Button onPress={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>

          <Button
            mode="contained"
            buttonColor={destructive ? "red" : undefined}
            onPress={onAction}
            loading={loading}
            disabled={loading}
          >
            {actionLabel}
          </Button>
        </View>
      }
    />
  );
}

ConfirmDialog.displayName = "ConfirmDialog";