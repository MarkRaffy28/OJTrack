import { fetchOrFail } from "../helpers/resource.helper.js";
import { ensureUserExists } from "../helpers/user.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { getStudentOjts, getSupervisorStudentsOjts } from "../models/ojt.model.js";
import { findUserByDatabaseId } from "../models/user.model.js";
import { getOjtsSchema } from "../validators/ojt.validator.js";

export const getOjtsController = async (req, res) => {
  const data = validate(res, getOjtsSchema, req.params);
  if (!data) return;

  const { role, databaseId } = data;

  if (!await ensureUserExists(res, findUserByDatabaseId, databaseId)) return;

  if (role === "student") {
    const studentOjts = await fetchOrFail(res, getStudentOjts, [databaseId], "Student OJTs not found");
    if (!studentOjts) return;

    return res.status(200).json(studentOjts);
    
  } else if (role === "supervisor") {
    const supervisorStudentsOjts = await fetchOrFail(res, getSupervisorStudentsOjts, [databaseId], "Supervisor students OJTs not found");
    if (!supervisorStudentsOjts) return;

    return res.status(200).json(supervisorStudentsOjts);
  }

  return res.status(400).json({ message: "Provide role and databaseId" });
};