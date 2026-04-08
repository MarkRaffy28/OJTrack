import { fetchOrFail } from "../helpers/resource.helper.js";
import { ensureUserExists } from "../helpers/user.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { getOjtsSchema, updateSupervisorNotesSchema } from "../validators/ojt.validator.js";
import { getStudentOjts, getSupervisorStudentsOjts, updateSupervisorNotes, getOjtStudentInfo } from "../models/ojt.model.js";
import { findUserByDatabaseId } from "../models/user.model.js";
import { logActivityController } from "./activity.controller.js";

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

export const updateSupervisorNotesController = async (req, res) => {
  const data = validate(res, updateSupervisorNotesSchema, { 
    ojtId: req.params.ojtId, 
    supervisorId: req.body.databaseId, 
    ...req.body 
  });
  if (!data) return;

  const { ojtId, supervisorId, notes } = data;

  const success = await fetchOrFail(res, updateSupervisorNotes, [ojtId, notes ?? null], "OJT record not found");
  if (!success) return;

  const studentInfo = await getOjtStudentInfo(ojtId);
  const studentName = studentInfo?.fullName || "a student";

  await logActivityController({
    databaseId: supervisorId,
    ojtId,
    action: "UPDATE_SUPERVISOR_NOTES",
    targetType: "OJT",
    targetId: ojtId,
    description: `You updated the supervisor notes for ${studentName}.`
  });

  res.status(200).json({ ojtId, supervisorNotes: notes });
};