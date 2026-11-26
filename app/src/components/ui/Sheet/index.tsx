import React, { forwardRef, useCallback } from "react";
import type { PropsWithChildren } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type {
  BottomSheetBackdropProps,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";

import { SheetSectionHeader } from "./SectionHeader";
import { SheetTitle } from "./Title";
import { useSheetStyles } from "./styles";

interface Props extends Omit<BottomSheetModalProps, "backdropComponent" | "snapPoints"> {
  snapPoints: string[];
}

export const SheetBase = forwardRef<BottomSheetModal, PropsWithChildren<Props>>(
  ({ children, snapPoints, ...props }, ref) => {
    const styles = useSheetStyles();

    const renderBackdrop = useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={styles.modal.background}
        handleIndicatorStyle={styles.modal.handleIndicator}
        {...props}
      >
        <BottomSheetView style={styles.content}>{children}</BottomSheetView>
      </BottomSheetModal>
    );
  },
);

SheetBase.displayName = "Sheet";

export const Sheet = Object.assign(SheetBase, {
  SectionHeader: SheetSectionHeader,
  Title: SheetTitle,
});
