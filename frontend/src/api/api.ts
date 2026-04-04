import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
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

export default API;
