import type { ComponentProps } from "react";
import { Dialog as PaperDialog } from "react-native-paper";

import { ConfirmDialog } from "./Confirm";
import { DeleteDialog } from "./Delete";
import { useDialogStyles } from "./styles";

function DialogBase(props: ComponentProps<typeof PaperDialog>) {
  return <PaperDialog {...props} />;
}

function DialogTitle({ style, ...props }: ComponentProps<typeof PaperDialog.Title>) {
  const styles = useDialogStyles();

  return <PaperDialog.Title {...props} style={[styles.title, style]} />;
}

export const Dialog = Object.assign(DialogBase, {
  Actions: PaperDialog.Actions,
  Content: PaperDialog.Content,
  Icon: PaperDialog.Icon,
  ScrollArea: PaperDialog.ScrollArea,
  Title: DialogTitle,

  Confirm: ConfirmDialog,
  Delete: DeleteDialog,
});
