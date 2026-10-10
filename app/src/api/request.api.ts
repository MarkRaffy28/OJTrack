import { ZodType } from "zod";
import { api } from "./client.api";

export const del = async <TRequest, TResponse>(
  url: string,
  data?: TRequest,
  requestSchema?: ZodType<TRequest>,
  responseSchema?: ZodType<TResponse>,
) => {
  const payload = requestSchema ? requestSchema.parse(data) : data;

  const response = await api.delete<TResponse>(url, {
    data: payload,
  });

  if (!responseSchema) {
    return response.data as TResponse;
  }

  return responseSchema.parse(response.data);
};

export const get = async <TResponse>(
  url: string,
  responseSchema?: ZodType<TResponse>,
) => {
  const response = await api.get<TResponse>(url);

  if (!responseSchema) {
    return response.data as TResponse;
  }

  return responseSchema?.parse(response.data);
};

export const patch = async <TRequest, TResponse>(
  url: string,
  data?: TRequest,
  requestSchema?: ZodType<TRequest>,
  responseSchema?: ZodType<TResponse>,
) => {
  const payload = requestSchema ? requestSchema.parse(data) : data;
  const response = await api.patch<TResponse>(url, payload);

  if (!responseSchema) {
    return response.data as TResponse;
  }

  return responseSchema?.parse(response.data);
};

export const put = async <TRequest, TResponse>(
  url: string,
  data?: TRequest,
  requestSchema?: ZodType<TRequest>,
  responseSchema?: ZodType<TResponse>,
) => {
  const payload = requestSchema ? requestSchema.parse(data) : data;
  const response = await api.put<TResponse>(url, payload);
  return responseSchema ? responseSchema.parse(response.data) : response.data as TResponse;
};

export const post = async <TRequest, TResponse>(
  url: string,
  data?: TRequest,
  requestSchema?: ZodType<TRequest>,
  responseSchema?: ZodType<TResponse>,
) => {
  const payload = requestSchema ? requestSchema.parse(data) : data;
  const response = await api.post<TResponse>(url, payload);

  if (!responseSchema) {
    return response.data as TResponse;
  }

  return responseSchema?.parse(response.data);
};
