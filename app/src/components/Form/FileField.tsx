import { StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

import { ICON_SIZES } from "@/constants/icons.constants";
import { Chip } from "@/components/ui/Chip";
import { useFieldContext } from "@/form/context";
import { useTheme } from "@/store/settings.store";
import { useDownloadFile } from "@/hooks/useDownloadFile";
import { useFilePicker } from "@/hooks/useFilePicker";
import { FileData } from "@/schemas/report.schema";

interface Props {
  label: string;
  icon: IconSource;
  mode?: "view" | "edit";
  accept?: string;
  disabled?: boolean;
  maxFiles?: number;
}

export function FormFileField({
  label,
  icon,
  mode = "edit",
  accept,
  disabled,
  maxFiles = 1,
}: Props) {
  const field = useFieldContext();
  const theme = useTheme();
  const { pickFile } = useFilePicker();
  const { downloadFile } = useDownloadFile();

  if (!field) {
    throw new Error("useFieldContext must be used within a Form");
  }

  const { value } = field.state;
  const files = (Array.isArray(value) ? value : []) as FileData[];
  const canAddMore = files.length < maxFiles;

  const handleFilePick = async () => {
    try {
      const result = await pickFile({ accept });
      if (result && canAddMore) {
        field.handleChange([...files, result]);
      }
    } catch (error) {
      console.error("File pick error:", error);
    }
  };

  const handleRemoveFile = (index: number) => {
    field.handleChange(files.filter((_, i) => i !== index));
  };

  const getFileUri = (file: FileData) => file.uri || file.url || file.path || "";

  if (mode === "view") {
    return (
      <View style={styles.container}>
        <Text
          variant="labelMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
        >
          {label}
        </Text>

        {files.length === 0 ? (
          <View
            style={[styles.viewCard, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <Icon
              source={icon}
              size={ICON_SIZES.md}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}
            >
              No files selected
            </Text>
          </View>
        ) : (
          <View style={styles.chipContainer}>
            {files.map((file, idx) => {
              const fileUri = getFileUri(file);
              return (
                <Chip
                  key={fileUri || `view-file-${idx}`}
                  text={file.name}
                  variant="filled"
                  tone="neutral"
                  size="small"
                  leftIcon="file-document-outline"
                  rightIcon="download"
                  onPress={() => downloadFile(fileUri, file.name)}
                />
              );
            })}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Icon
          source={icon}
          size={ICON_SIZES.md}
          color={disabled ? theme.colors.onSurfaceDisabled : theme.colors.primary}
        />

        <Text
          variant="labelLarge"
          style={[
            styles.labelText,
            {
              color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface,
            },
          ]}
        >
          {label}
        </Text>

        {maxFiles > 1 && (
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant, marginLeft: "auto" }}
          >
            {files.length}/{maxFiles}
          </Text>
        )}
      </View>

      {files.length > 0 && (
        <View style={styles.chipContainer}>
          {files.map((file, idx) => (
            <Chip
              key={getFileUri(file) || `edit-file-${idx}`}
              text={file.name}
              variant="filled"
              tone="neutral"
              size="small"
              leftIcon="file-document-outline"
              onClose={() => handleRemoveFile(idx)}
            />
          ))}
        </View>
      )}

      {canAddMore && (
        <Button
          mode="outlined"
          onPress={handleFilePick}
          disabled={disabled}
          style={styles.uploadButton}
          icon="folder-open-outline"
        >
          {files.length === 0 ? "Choose File" : "Add File"}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  labelText: {
    fontWeight: "600",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  uploadButton: {
    marginBottom: 12,
  },
  viewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
});
