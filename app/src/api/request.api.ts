import { ZodType } from "zod";
import { api } from "./client.api";

export const post = async <TRequest, TResponse>(
  url: string,
  data: TRequest,
  requestSchema: ZodType<TRequest>,
  responseSchema: ZodType<TResponse>,
) => {
  const payload = requestSchema.parse(data);

  const response = await api.post<TResponse>(url, payload);

  return responseSchema.parse(response.data);
};
