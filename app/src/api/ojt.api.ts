import { OJTSchema, OJTsResponseSchema } from "@/schemas/ojt.schema";
import { get } from "./request.api";

export const getOJT = async () => get("/ojt", OJTSchema);

export const getOJTs = async () => get("/ojt/all", OJTsResponseSchema);

export const getOJTById = async (id: number) => get(`/ojt/${id}`, OJTSchema);