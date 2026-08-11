import { useAuthStore } from "@/store/auth.store";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session;

  if (session?.access_token && config.url !== "/auth/login") {
    config.headers.Authorization = `${session.token_type} ${session.access_token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.group();

      console.log("Status:", error.response?.status);
      console.log("Method:", error.config?.method?.toUpperCase());
      console.log("URL:", error.config?.url);
      console.log("Headers:", error.config?.headers);
      console.log("Request:", error.config?.data);
      console.log("Response:", error.response?.data);

      console.groupEnd();
    } else {
      console.error(error);
    }

    return Promise.reject(error);
  },
);
