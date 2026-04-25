import { logActivityController } from "./activity.controller.js";
import { fetchOrFail } from "../helpers/resource.helper.js";
import { ensureUserExists } from "../helpers/user.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { findUserByDatabaseId } from "../models/user.model.js";
import { 
  createOjtRecord, deleteOjtRecord, getOjtStudentInfo, getStudentOjts, updateSupervisorNotes, updateOjtRecord, updateOjtSupervisor, 
  getSupervisorStudentsOjts, getAdminStudentsOjts 
} from "../models/ojt.model.js";
import { createOjtSchema, getOjtsSchema, ojtIdSchema, updateSupervisorNotesSchema, updateOjtSchema, updateOjtSupervisorSchema } from "../validators/ojt.validator.js";

export const createOjtController = async (req, res) => {
  const data = validate(res, createOjtSchema, req.body);
  if (!data) return;

  const newOjtId = await createOjtRecord(data);
  if (!newOjtId) return res.status(500).json({ message: "Failed to create OJT record" });

  res.status(201).json({ message: "OJT record created successfully", ojtId: newOjtId });
};

export const deleteOjtController = async (req, res) => {
  const data = validate(res, ojtIdSchema, req.params);
  if (!data) return;

  const { id } = data;

  const success = await fetchOrFail(res, deleteOjtRecord, [id], "Ojt record not found");
  if (!success) return;

  res.status(200).json({ message: "OJT record deleted successfully" });
};


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
    
  } else if (role === "admin") {
    if (req.user?.role !== "admin" || Number(req.user?.id) !== Number(databaseId)) {
      return res.status(403).json({ message: "Unauthorized access to admin OJT records" });
    }

    const adminStudentsOjts = await fetchOrFail(res, getAdminStudentsOjts, [], "Admin OJT records not found");
    if (!adminStudentsOjts) return;

    return res.status(200).json(adminStudentsOjts);
  }

  return res.status(400).json({ message: "Provide role and databaseId" });
};

export const updateOjtController = async (req, res) => {
  const data = validate(res, updateOjtSchema, { ojtId: req.params.ojtId, ...req.body });
  if (!data) return;

  const { ojtId } = data;

  const success = await fetchOrFail(res, updateOjtRecord, [ojtId, data], "Ojt record not found");
  if (!success) return;

  if (req.user?.id) {
    await logActivityController({
      databaseId: req.user.id,
      action: "EDIT_USER",
      targetType: "OJT",
      targetId: ojtId,
      description: "Updated OJT record details"
    });
  }

  res.status(200).json({ message: "OJT record updated successfully" });
};

export const updateOjtSupervisorController = async (req, res) => {
  const data = validate(res, updateOjtSupervisorSchema, { ojtId: req.params.ojtId, ...req.body });
  if (!data) return;

  const { ojtId, supervisorId } = data;

  const success = await fetchOrFail(res, updateOjtSupervisor, [ojtId, supervisorId], "Ojt record not found");
  if (!success) return;

  if (req.user?.id) {
    await logActivityController({
      databaseId: req.user.id,
      action: "ASSIGN_SUPERVISOR",
      targetType: "OJT",
      targetId: ojtId,
      description: "Assigned a supervisor to an OJT record"
    });
  }

  res.status(200).json({ message: "OJT supervisor updated successfully" });
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