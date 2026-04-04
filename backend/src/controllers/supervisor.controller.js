import { fetchOrFail } from "../helpers/resource.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { supervisorStatsSchema } from "../validators/supervisor.validator.js";
import { getSupervisorStats } from "../models/supervisor.model.js";

export const getSupervisorStatsController = async (req, res) => {
  const data = validate(res, supervisorStatsSchema, req.params);
  if (!data) return;

  const { supervisorId } = data;

  const stats = await fetchOrFail(res, getSupervisorStats, [supervisorId], "No stats found");
  if (!stats) return;

  res.status(200).json(stats);
};