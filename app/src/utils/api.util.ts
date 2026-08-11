import { AxiosError } from "axios";

export const getApiErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return "Unable to connect to server.";
    }

    return error.response.data?.message ?? "An unexpected error occurred.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};
