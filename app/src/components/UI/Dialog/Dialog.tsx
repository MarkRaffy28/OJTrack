import { ReactNode } from "react";
import { Dialog as PaperDialog, Portal, Text } from "react-native-paper";

import { useDialogStyles } from "./styles";

export type BaseDialogProps = {
  visible: boolean;

  item?: string;

  title?: ReactNode;
  description?: ReactNode;

  cancelLabel?: ReactNode;

  loading?: boolean;

  onCancel: () => void;
};

type Props = {
  visible: boolean;
  title: ReactNode;
  description?: ReactNode;

  children?: ReactNode;

  onDismiss: () => void;

  actions?: ReactNode;
};

export function Dialog({
  visible,
  title,
  description,
  children,
  onDismiss,
  actions,
}: Props) {
  const styles = useDialogStyles();

  return (
    <Portal>
      <PaperDialog visible={visible} onDismiss={onDismiss}>
        <PaperDialog.Title style={styles.title}>{title}</PaperDialog.Title>

        {(description || children) && (
          <PaperDialog.Content>
            {description && <Text variant="bodyMedium">{description}</Text>}
            {children}
          </PaperDialog.Content>
        )}

        {actions && <PaperDialog.Actions>{actions}</PaperDialog.Actions>}
      </PaperDialog>
    </Portal>
  );
}
