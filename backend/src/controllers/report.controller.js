import { treeifyError } from "zod";
import { logActivityController } from "./activity.controller.js";
import { deleteFiles } from "../utils/storage.util.js";
import { createReportSchema, deleteReportSchema, fetchReportsSchema, updateReportSchema } from "../validators/report.validator.js";
import { createReport, fetchReports, updateReport, deleteReport, getReportById } from "../models/report.model.js";


export const createReportController = async (req, res) => {
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

    const insertId = await createReport(parsed.data);

    await logActivityController({
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

export const deleteReportController = async (req, res) => {
  try {
    const parsed = deleteReportSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }
    const { reportId } = parsed.data;

    const report = await getReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    if (report.status === 'approved') {
      return res.status(403).json({ message: "Cannot delete an approved report" });
    }

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
    }

    res.status(200).json({ message: "OJT report deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const fetchReportsController = async (req, res) => {
  try {
    const parsed = fetchReportsSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }
    const { ojtId } = parsed.data;

    const reports = await fetchReports(ojtId);

    res.status(200).json({
      message: "OJT reports fetched successfully",
      data: reports
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateReportController = async (req, res) => {
  try {
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

    const parsed = updateReportSchema.safeParse({ ...req.body, ...req.params, attachments: finalAttachments });

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }
    const { reportId } = parsed.data;

    const existing = await getReportById(reportId);
    if (!existing) {
      return res.status(404).json({ message: "Report not found" });
    }
    if (existing.status === 'approved') {
      return res.status(403).json({ message: "Cannot edit an approved report" });
    }

    await updateReport(reportId, parsed.data);

    await logActivityController({
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

    if (removedAttachments.length > 0) {
      await deleteFiles(removedAttachments);
    }

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
