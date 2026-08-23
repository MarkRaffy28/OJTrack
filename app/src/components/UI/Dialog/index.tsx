import type { ComponentProps } from "react";
import { Dialog as PaperDialog } from "react-native-paper";

import { DeleteDialog } from "./Delete";
import { DiscardDialog } from "./Discard";
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

  Delete: DeleteDialog,
  Discard: DiscardDialog,
});
