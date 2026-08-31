import * as auth from "./auth.api";
import * as profile from "./profile.api";
import { api as client } from "./client.api";

export const api = {
  ...auth,
  ...profile,
  client,
};
