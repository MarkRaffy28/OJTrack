import { ReactNode } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";

import { capitalize } from "@/utils/string.util";
import { Dialog, type BaseDialogProps } from "./Dialog";
import { useDialogStyles } from "./styles";

interface Props extends BaseDialogProps {
  discardLabel?: ReactNode;
  onDiscard: () => void;
}

export function DiscardDialog({
  visible,
  item,
  title,
  description,
  cancelLabel = "Cancel",
  discardLabel = "Discard",
  loading = false,
  onCancel,
  onDiscard,
}: Props) {
  const styles = useDialogStyles();

  const defaultTitle = title ?? `Discard ${capitalize(item ?? "Changes")}`;

  const defaultDescription =
    description ??
    `You have unsaved changes. Are you sure you want to discard ${item ?? "them"}?`;

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
            onPress={onDiscard}
            loading={loading}
            disabled={loading}
          >
            {discardLabel}
          </Button>
        </View>
      }
    />
  );
}

DiscardDialog.displayName = "DiscardDialog";
