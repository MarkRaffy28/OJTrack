import { ReactNode } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";

import { useTheme } from "@/store/settings.store";
import { capitalize } from "@/utils/string.util";
import { Dialog, type BaseDialogProps } from "./Dialog";
import { useDialogStyles } from "./styles";

interface Props extends BaseDialogProps {
  deleteLabel?: ReactNode;
  onDelete: () => void;
}

export function DeleteDialog({
  visible,
  item,
  title,
  description,
  cancelLabel = "Cancel",
  deleteLabel = "Delete",
  loading = false,
  onCancel,
  onDelete,
}: Props) {
  const theme = useTheme();
  const styles = useDialogStyles();

  const defaultTitle = title ?? `Delete ${capitalize(item ?? "")}`;

  const defaultDescription =
    description ??
    `Are you sure you want to delete this ${item}? This action cannot be undone.`;

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
            onPress={onDelete}
            loading={loading}
            disabled={loading}
            buttonColor={theme.colors.error}
            textColor={theme.colors.onError}
          >
            {deleteLabel}
          </Button>
        </View>
      }
    />
  );
}

DeleteDialog.displayName = "DeleteDialog";
