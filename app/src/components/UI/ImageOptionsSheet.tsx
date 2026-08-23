import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { List } from "react-native-paper";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import { Sheet } from "@/components/ui/Sheet";
import { ImagePickerResult, useImagePicker } from "@/hooks/useImagePicker";

export type ImageOptionsSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type Props = {
  onImageSelected: (image: ImagePickerResult) => void;
};

export const ImageOptionsSheet = forwardRef<ImageOptionsSheetRef, Props>(
  ({ onImageSelected }, ref) => {
    const { pickFromLibrary, takePhoto } = useImagePicker();

    const sheetRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const handleTakePhoto = useCallback(async () => {
      const image = await takePhoto();

      if (!image) {
        return;
      }

      sheetRef.current?.dismiss();
      onImageSelected(image);
    }, [takePhoto, onImageSelected]);

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
          onPress={() => void handleTakePhoto()}
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
