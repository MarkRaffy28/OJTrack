import axios from "axios";
import { ZodError } from "zod";

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Unable to connect to server.";
    }

    return error.response.data?.message ?? "An unexpected error occurred.";
  }

  if (error instanceof ZodError) {
    const issueDetails = error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    return `Invalid data format (${issueDetails})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};
