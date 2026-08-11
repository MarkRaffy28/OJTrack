import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../../../assets/favicon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>OJTrack</Text>
        <Text style={styles.subtitle}>On-the-Job Training Attendance & Monitoring</Text>
      </View>

      <View style={styles.loading}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 80,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 96,
    height: 96,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
  },

  loading: {
    alignItems: "center",
    gap: 8,
  },

  loadingText: {
    fontSize: 13,
  },
});
