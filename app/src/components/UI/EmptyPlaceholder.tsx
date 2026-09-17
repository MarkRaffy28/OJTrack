import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

type Props = {
  title: string;
  description: string;
};

export function EmptyPlaceholder({ title, description }: Props) {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>

      <Text variant="bodyMedium" style={styles.description}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 6,
    textAlign: "center",
  },
});
