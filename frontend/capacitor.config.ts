import type { CapacitorConfig } from "@capacitor/cli";
import "dotenv/config";

const config: CapacitorConfig = {
  appId: "com.ojtrack.app",
  appName: "OJTrack",
  webDir: "dist",

  server: {
    // url: process.env.SERVER_URL,
    cleartext: true,
    androidScheme: "http",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
    },
  },
};

export default config;
