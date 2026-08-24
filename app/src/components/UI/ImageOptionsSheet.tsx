import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { List } from "react-native-paper";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { Sheet } from "@/components/ui/Sheet";
import { useImagePicker } from "@/hooks/useImagePicker";
import { ImagePickerResult } from "@/types/media.types";

export type ImageOptionsSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type Props = {
  onImageSelected: (image: ImagePickerResult) => void;
  onTakePhoto: () => void;
};

export const ImageOptionsSheet = forwardRef<ImageOptionsSheetRef, Props>(
  ({ onImageSelected, onTakePhoto }, ref) => {
    const { pickFromLibrary } = useImagePicker();

    const sheetRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const handleChooseFromLibrary = useCallback(async () => {
      const image = await pickFromLibrary();

      if (!image) {
        return;
      }

      sheetRef.current?.dismiss();
      onImageSelected(image);
    }, [pickFromLibrary, onImageSelected]);

    return (
      <Sheet ref={sheetRef} snapPoints={["25%"]}>
        <Sheet.Title>Profile Picture</Sheet.Title>

        <List.Item
          title="Take Photo"
          left={(props) => <List.Icon {...props} icon="camera" />}
          onPress={onTakePhoto}
        />

        <List.Item
          title="Choose from Gallery"
          left={(props) => <List.Icon {...props} icon="image" />}
          onPress={() => void handleChooseFromLibrary()}
        />
      </Sheet>
    );
  },
);

ImageOptionsSheet.displayName = "ImageOptionsSheet";
