import * as auth from "./auth.api";
import * as attendance from "./attendance.api";
import * as dashboard from "./dashboard.api";
import * as ojt from "./ojt.api";
import * as profile from "./profile.api";
import * as reports from "./report.api";
import * as evaluations from "./evaluation.api";
import { api as client } from "./client.api";

export const api = {
  ...auth,
  ...attendance,
  ...dashboard,
  ...ojt,
  ...profile,
  ...reports,
  ...evaluations,
  client,
};
