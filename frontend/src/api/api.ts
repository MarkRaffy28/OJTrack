import axios from "axios";
import { Preferences } from "@capacitor/preferences";

const BASE_URL_KEY = "api_base_url";
const DEFAULT_API_URL = `${import.meta.env.VITE_API_URL}/api`;


const normalizeUrl = (url: string): string => {
  let normalized = url.trim().replace(/\/$/, "");
  if (normalized.includes("ngrok-free.dev") && normalized.startsWith("http://")) {
    normalized = normalized.replace("http://", "https://");
  }
  return normalized;
};

const API = axios.create({
  baseURL: DEFAULT_API_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = "Could not connect to server. Please try again later.";
    }
    return Promise.reject(error);
  }
);


export const getRootURL = (): string => {
  const baseUrl = API.defaults.baseURL || DEFAULT_API_URL;
  return baseUrl.replace(/\/api$/, "");
};


export const getMediaUrl = (relativePath: string): string => {
  const root = getRootURL();
  const cleanPath = relativePath.replace(/\\/g, "/").replace(/^\.\//, "");
  const url = `${root}/${cleanPath}`;
  if (root.includes("ngrok")) {
    return `${url}${url.includes("?") ? "&" : "?"}ngrok-skip-browser-warning=true`;
  }
  return url;
};


export const getBaseURL = async (): Promise<string> => {
  const { value } = await Preferences.get({ key: BASE_URL_KEY });
  return normalizeUrl(value ?? DEFAULT_API_URL);
};

export const initAPI = async (): Promise<void> => {
  const url = await getBaseURL();
  API.defaults.baseURL = normalizeUrl(url);
};

export const switchServer = async (url: string): Promise<void> => {
  const normalized = normalizeUrl(url);
  const apiUrl = `${normalized}/api`;
  await Preferences.set({ key: BASE_URL_KEY, value: apiUrl });
  API.defaults.baseURL = apiUrl;
};

export const resetServer = async (): Promise<void> => {
  await Preferences.remove({ key: BASE_URL_KEY });
  API.defaults.baseURL = DEFAULT_API_URL;
};

export default API;