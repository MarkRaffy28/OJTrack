export type ImagePickerResult = {
  uri: string;
  width: number;
  height: number;
  mimeType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
};
