import type { CapacitorConfig } from "@capacitor/cli";
import "dotenv/config";

const config: CapacitorConfig = {
  appId: "com.ojtrack.app",
  appName: "OJTrack",
  webDir: "dist",

  server: {
    url: process.env.API_URL,
    cleartext: true,
    androidScheme: "http",
  },
};

export default config;
