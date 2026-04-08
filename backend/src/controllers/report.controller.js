import { fetchOrFail } from "../helpers/resource.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { logActivityController } from "./activity.controller.js";
import { deleteFiles } from "../utils/storage.util.js";
import { getStudentOjts } from "../models/ojt.model.js";
import { createReport, getReports, updateReport, deleteReport, getReportById, getSupervisorReports, updateReportStatus } from "../models/report.model.js";
import { createReportSchema, deleteReportSchema, getReportsSchema, updateReportSchema, getSupervisorReportsSchema, updateReportStatusSchema } from "../validators/report.validator.js";


export const createReportController = async (req, res) => {
  const files = req.files ? req.files.map(f => ({
    filename: f.filename,
    path: f.path,
    originalName: f.originalname,
    size: f.size
  })) : null;

  const data = validate(res, createReportSchema, { ...req.body, attachments: files });
  if (!data) return;

  const {studentId, ojtId, type, title } = data;

  if (!await fetchOrFail(res, getStudentOjts, [studentId], "Student's OJTs not found")) return;

  const insertId = await createReport(data);

  await logActivityController({
    databaseId: studentId,
    ojtId: ojtId,
    action: "CREATE_REPORT",
    targetType: "REPORT",
    targetId: insertId,
    description: `Created ${type} report: ${title || "No title"}`
  });

  res.status(201).json({
    message: "OJT report created successfully",
    reportId: insertId,
    attachments: files
  });
};

export const deleteReportController = async (req, res) => {
  const data = validate(res, deleteReportSchema, req.params);
  if (!data) return;

  const { reportId } = data;

  const report = await fetchOrFail(res, getReportById, [reportId], "Report not found");
  if (!report) return;

  if (report.status === 'approved') {
    return res.status(403).json({ message: "Cannot delete an approved report" });
  };

  await deleteReport(reportId);

  await logActivityController({
    databaseId: report.student_id,
    ojtId: report.ojt_id,
    action: "DELETE_REPORT",
    targetType: "REPORT",
    targetId: reportId,
    description: `Deleted ${report.type} report: ${report.title || "No title"}`
  });

  if (report.attachments) {
    await deleteFiles(report.attachments);
  };

  res.status(200).json({ message: "OJT report deleted successfully" });
};

export const getReportsController = async (req, res) => {
  const data = validate(res, getReportsSchema, req.params);
  if (!data) return;

  const { ojtId } = data;
  
  const reports = await getReports(ojtId);
  if (!reports) return;

  res.status(200).json({
    message: "OJT reports fetched successfully",
    data: reports
  });
};

export const updateReportController = async (req, res) => {
  const newFiles = req.files ? req.files.map(f => ({
    filename: f.filename,
    path: f.path,
    originalName: f.originalname,
    size: f.size
  })) : [];

  let keptAttachments = [];
  if (req.body.existingAttachments) {
    try {
      keptAttachments = JSON.parse(req.body.existingAttachments);
    } catch {
      keptAttachments = [];
    };
  };

  const mergedAttachments = [...keptAttachments, ...newFiles];
  const finalAttachments = mergedAttachments.length > 0 ? mergedAttachments : null;

  const data = validate(res, updateReportSchema, { ...req.body, ...req.params, attachments: finalAttachments });
  if (!data) return;
  
  const { reportId } = data;

  const report = await fetchOrFail(res, getReportById, [reportId], "Report not found");
  if (!report) return;

  if (report.status === 'approved') {
    return res.status(403).json({ message: "Cannot edit an approved report" });
  };

  await updateReport(reportId, data);

  await logActivityController({
    databaseId: report.student_id,
    ojtId: report.ojt_id,
    action: "UPDATE_REPORT",
    targetType: "REPORT",
    targetId: reportId,
    description: `Updated ${report.type} report: ${report.title || "No title"}`
  });

  const removedAttachments = report.attachments?.filter(
    old => !keptAttachments.some(kept => kept.filename === old.filename)
  ) || [];

  if (removedAttachments.length > 0) {
    await deleteFiles(removedAttachments);
  };

  res.status(200).json({
    message: "OJT report updated successfully",
    reportId,
    attachments: finalAttachments
  });
};

export const getSupervisorReportsController = async (req, res) => {
  const data = validate(res, getSupervisorReportsSchema, req.params);
  if (!data) return;

  const { supervisorId } = data;
  
  const reports = await getSupervisorReports(supervisorId);
  if (!reports) return;

  res.status(200).json({
    message: "Supervisor reports fetched successfully",
    data: reports
  });
};

export const updateReportStatusController = async (req, res) => {
  const data = validate(res, updateReportStatusSchema, { ...req.params, ...req.body });
  if (!data) return;

  const { reportId, status, feedback } = data;

  const report = await fetchOrFail(res, getReportById, [reportId], "Report not found");
  if (!report) return;

  await updateReportStatus(reportId, status, req.user.id, feedback);

  await logActivityController({
    databaseId: report.student_id,
    ojtId: report.ojt_id,
    action: "UPDATE_REPORT",
    targetType: "REPORT",
    targetId: reportId,
    description: `Report marked as ${status} by supervisor`
  });

  res.status(200).json({
    message: `Report ${status} successfully`
  });
};
