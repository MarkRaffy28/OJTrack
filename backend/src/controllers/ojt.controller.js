import { fetchOrFail } from "../helpers/resource.helper.js";
import { ensureUserExists } from "../helpers/user.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { fetchStudentOjts, fetchSupervisorStudentsOjts } from "../models/ojt.model.js";
import { findUserByDatabaseId } from "../models/user.model.js";
import { fetchOjtsSchema } from "../validators/ojt.validator.js";

export const fetchOjtsController = async (req, res) => {
  const data = validate(res, fetchOjtsSchema, req.params);
  if (!data) return;

  const { role, databaseId } = data;

  if (!await ensureUserExists(res, findUserByDatabaseId, databaseId)) return;

  if (role === "student") {
    const studentOjts = await fetchOrFail(res, fetchStudentOjts, [databaseId], "Student OJTs not found");
    if (!studentOjts) return;

    return res.status(200).json(studentOjts);
    
  } else if (role === "supervisor") {
    const supervisorStudentsOjts = await fetchOrFail(res, fetchSupervisorStudentsOjts, [databaseId], "Supervisor students OJTs not found");
    if (!supervisorStudentsOjts) return;

    return res.status(200).json(supervisorStudentsOjts);
  }

  return res.status(400).json({ message: "Provide role and databaseId" });
};