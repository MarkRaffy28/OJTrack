import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import {
  HelperText,
  List,
  Modal,
  Portal,
  Searchbar,
  Text,
  TextInput,
} from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

import { useFieldContext } from "@/form/context";

export interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  icon: IconSource;
  options: Option[];
  searchable?: boolean;
}

export function FormSelect({ label, icon, options, searchable = false }: Props) {
  const field = useFieldContext();

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

  const handleOpen = () => {
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

  const handleSelect = (option: Option) => {
    field.handleChange(option.value);
    field.handleBlur();
    field.validate("blur");
    setVisible(false);
    setQuery("");
  };

  return (
    <>
      <Pressable onPress={handleOpen}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={selected?.label ?? ""}
            editable={false}
            left={<TextInput.Icon icon={icon} />}
            right={<TextInput.Icon icon="chevron-down" />}
            error={!!error}
          />
        </View>
      </Pressable>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={handleDismiss}
          contentContainerStyle={{
            margin: 24,
            backgroundColor: "white",
            borderRadius: 12,
            maxHeight: "80%",
          }}
        >
          <View style={{ padding: 16 }}>
            <Text variant="titleMedium">{label}</Text>

            {searchable && (
              <Searchbar
                value={query}
                onChangeText={setQuery}
                style={{ marginTop: 12 }}
              />
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <List.Item
                  title={item.label}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={item.value === value ? "radiobox-marked" : "radiobox-blank"}
                    />
                  )}
                  onPress={() => handleSelect(item)}
                />
              )}
            />
          </View>
        </Modal>
      </Portal>
    </>
  );
}
