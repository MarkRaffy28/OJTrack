import { treeifyError } from "zod";
import { logActivity } from "./activity.controller.js";
import { reportStorage, deleteFiles } from "../utils/storage.util.js";
import { createReportSchema, updateReportSchema } from "../validators/report.validator.js";
import { createReport as _createReport, fetchReports as _fetchReports, updateReport as _updateReport, deleteReport as _deleteReport, getReportById as _getReportById } from "../models/report.model.js";


export const createReport = async (req, res) => {
  try {
    const files = req.files ? req.files.map(f => ({
      filename: f.filename,
      path: f.path,
      originalName: f.originalname,
      size: f.size
    })) : null;

    const parsed = createReportSchema.safeParse({ ...req.body, attachments: files });

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }

    const insertId = await _createReport(parsed.data);

    await logActivity({
      databaseId: parsed.data.studentId,
      ojtId: parsed.data.ojtId,
      action: "CREATE_REPORT",
      targetType: "REPORT",
      targetId: insertId,
      description: `Created ${parsed.data.type} report: ${parsed.data.title || "No title"}`
    });

    res.status(201).json({
      message: "OJT report created successfully",
      reportId: insertId,
      attachments: files
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const report = await _getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    if (report.status === 'approved') {
      return res.status(403).json({ message: "Cannot delete an approved report" });
    }

    await _deleteReport(reportId);

    await logActivity({
      databaseId: report.student_id,
      ojtId: report.ojt_id,
      action: "DELETE_REPORT",
      targetType: "REPORT",
      targetId: reportId,
      description: `Deleted ${report.type} report: ${report.title || "No title"}`
    });

    if (report.attachments) {
      await deleteFiles(report.attachments);
    }

    res.status(200).json({ message: "OJT report deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const fetchReports = async (req, res) => {
  try {
    const { ojtId } = req.params;

    if (!ojtId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const reports = await _fetchReports(ojtId);

    res.status(200).json({
      message: "OJT reports fetched successfully",
      data: reports
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const existing = await _getReportById(reportId);
    if (!existing) {
      return res.status(404).json({ message: "Report not found" });
    }
    if (existing.status === 'approved') {
      return res.status(403).json({ message: "Cannot edit an approved report" });
    }

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
      }
    }

    const mergedAttachments = [...keptAttachments, ...newFiles];
    const finalAttachments = mergedAttachments.length > 0 ? mergedAttachments : null;

    const parsed = updateReportSchema.safeParse({ ...req.body, attachments: finalAttachments });

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }

    await _updateReport(reportId, parsed.data);

    await logActivity({
      databaseId: existing.student_id,
      ojtId: existing.ojt_id,
      action: "UPDATE_REPORT",
      targetType: "REPORT",
      targetId: reportId,
      description: `Updated ${parsed.data.type} report: ${parsed.data.title || "No title"}`
    });

    const removedAttachments = existing.attachments?.filter(
      old => !keptAttachments.some(kept => kept.filename === old.filename)
    ) || [];

    await deleteFiles(removedAttachments);

    res.status(200).json({
      message: "OJT report updated successfully",
      reportId,
      attachments: finalAttachments
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
