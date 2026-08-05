import axios from "axios";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.group();

      console.log("Status:", error.response?.status);
      console.log("Method:", error.config?.method?.toUpperCase());
      console.log("URL:", error.config?.url);
      console.log("Request:", error.config?.data);
      console.log("Response:", error.response?.data);

      console.groupEnd();
    } else {
      console.error(error);
    }

    return Promise.reject(error);
  },
);
