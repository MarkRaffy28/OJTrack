import { useCallback } from "react";
import * as DocumentPicker from "expo-document-picker";

interface PickerOptions {
  accept?: string;
}

interface FileData {
  uri: string;
  name: string;
  size?: number;
  type?: string;
}

export function useFilePicker() {
  const pickFile = useCallback(
    async (options?: PickerOptions): Promise<FileData | null> => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: options?.accept || "*/*",
          copyToCacheDirectory: true,
        });

        if (result.canceled) {
          return null;
        }

        const file = result.assets[0];
        return {
          uri: file.uri,
          name: file.name,
          size: file.size,
          type: file.mimeType,
        };
      } catch (error) {
        console.error("Document picker error:", error);
        return null;
      }
    },
    [],
  );

  return { pickFile };
}
