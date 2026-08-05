import * as auth from "./auth.api";
import { api as client } from "./client.api";

export const api = {
  ...auth,
  client,
};
