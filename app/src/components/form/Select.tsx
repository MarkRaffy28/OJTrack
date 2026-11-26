import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import {
  HelperText,
  Icon,
  IconButton,
  List,
  Modal,
  Portal,
  Searchbar,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

import { ICON_SIZES } from "@/constants/icons.constants";
import { useFieldContext } from "@/form/context";

export interface Option<T = string> {
  label: string;
  value: T;
}

interface Props<T = string> {
  label: string;
  icon: IconSource;
  options: Option<T>[];
  searchable?: boolean;
  disabled?: boolean;
  mode?: "view" | "edit";
}

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const ROW_SPACING = 4;
const LIST_MAX_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS + ROW_SPACING * VISIBLE_ITEMS;

export function FormSelect<T = string>({
  label,
  icon,
  options,
  searchable = false,
  disabled = false,
  mode = "edit",
}: Props<T>) {
  const field = useFieldContext();
  const theme = useTheme();

  if (!field) {
    throw new Error("useFieldContext must be used within a Form");
  }

  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  const {
    value,
    meta: { isTouched, errors },
  } = field.state;

  const error = isTouched && errors.length ? String(errors[0]?.message) : undefined;

  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !query) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase()),
    );
  }, [options, query, searchable]);

  const iconColor = disabled
    ? theme.colors.onSurfaceDisabled
    : error
      ? theme.colors.error
      : theme.colors.primary;

  const labelColor = disabled
    ? theme.colors.onSurfaceDisabled
    : error
      ? theme.colors.error
      : theme.colors.onSurface;

  const handleOpen = () => {
    if (disabled) return;

    field.handleBlur();
    field.validate("blur");
    setVisible(true);
  };

  const handleDismiss = () => {
    field.handleBlur();
    field.validate("blur");
    setVisible(false);
    setQuery("");
  };

  const handleSelect = (option: Option<T>) => {
    if (disabled) return;

    field.handleChange(option.value);
    field.handleBlur();
    field.validate("blur");
    setVisible(false);
    setQuery("");
  };

  if (mode === "view") {
    return (
      <View style={[styles.viewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={[styles.viewIconBadge, { backgroundColor: theme.colors.surface }]}>
          <Icon source={icon} size={ICON_SIZES.lg} color={theme.colors.primary} />
        </View>

        <View style={styles.viewTextColumn}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>

          <Text
            variant="titleMedium"
            style={[styles.viewValue, { color: theme.colors.onSurface }]}
          >
            {selected?.label ?? "—"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.labelRow}>
          <Icon source={icon} size={ICON_SIZES.md} color={iconColor} />

          <Text variant="labelLarge" style={[styles.labelText, { color: labelColor }]}>
            {label}
          </Text>
        </View>

        <Pressable onPress={handleOpen} disabled={disabled}>
          {({ pressed }) => (
            <View pointerEvents="none" style={{ opacity: pressed ? 0.85 : 1 }}>
              <TextInput
                mode="outlined"
                value={selected?.label ?? ""}
                placeholder={`Select ${label}`}
                editable={!disabled}
                disabled={disabled}
                right={<TextInput.Icon icon={visible ? "chevron-up" : "chevron-down"} />}
                error={!!error}
                outlineColor={theme.colors.outlineVariant}
                activeOutlineColor={theme.colors.primary}
                style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                outlineStyle={styles.inputOutline}
              />
            </View>
          )}
        </Pressable>

        <HelperText type="error" visible={!!error} padding="none">
          {error}
        </HelperText>
      </View>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={handleDismiss}
          contentContainerStyle={styles.modalContent}
        >
          <Surface style={styles.sheet} elevation={4}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Icon source={icon} size={20} color={theme.colors.onPrimaryContainer} />
                </View>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {label}
                </Text>
              </View>

              <IconButton
                icon="close"
                size={ICON_SIZES.sm}
                iconColor={theme.colors.onSurfaceVariant}
                onPress={handleDismiss}
              />
            </View>

            {searchable && (
              <Searchbar
                placeholder="Search"
                value={query}
                onChangeText={setQuery}
                elevation={0}
                style={[
                  styles.searchbar,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
                inputStyle={{ color: theme.colors.onSurfaceVariant }}
                iconColor={theme.colors.onSurfaceVariant}
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.value)}
              style={{ maxHeight: LIST_MAX_HEIGHT }}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon
                    source="magnify-close"
                    size={ICON_SIZES.xl}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
                  >
                    No results found
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;

                return (
                  <List.Item
                    title={item.label}
                    onPress={() => handleSelect(item)}
                    style={styles.row}
                    titleStyle={{ color: theme.colors.onSurface }}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={isSelected ? "radiobox-marked" : "radiobox-blank"}
                        color={
                          isSelected
                            ? theme.colors.primary
                            : theme.colors.onSurfaceVariant
                        }
                      />
                    )}
                  />
                );
              }}
            />
          </Surface>
        </Modal>
      </Portal>
    </>
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
  input: {
    fontSize: 15,
  },
  inputOutline: {
    borderRadius: 16,
  },
  viewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  viewIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  viewTextColumn: {
    flex: 1,
    gap: 2,
  },
  viewValue: {
    fontWeight: "700",
  },
  modalContent: {
    marginHorizontal: 24,
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 20,
    paddingBottom: 8,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchbar: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  row: {
    borderRadius: 12,
    marginVertical: 2,
    marginHorizontal: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
});
