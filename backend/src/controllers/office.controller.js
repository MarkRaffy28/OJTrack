import crypto from "crypto";
import { logActivityController } from "./activity.controller.js";
import { fetchOrFail } from "../helpers/resource.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { createOffice, deleteOffice, getOfficeById, getOfficesList, updateOffice } from "../models/office.model.js";
import { getOfficeQrSchema, officeIdSchema, createOfficeSchema, updateOfficeSchema } from "../validators/office.validator.js";

const SECRET = process.env.QR_SECRET;

export const createOfficeController = async (req, res) => {
  const data = validate(res, createOfficeSchema, req.body);
  if (!data) return;

  const newOfficeId = await createOffice(data);

  if (req.user?.id) {
    await logActivityController({
      databaseId: req.user.id,
      action: "CREATE_OFFICE",
      targetType: "OFFICE",
      targetId: newOfficeId,
      description: `Created new office: ${data.name}`
    });
  }

  res.status(201).json({ id: newOfficeId, message: "Office created successfully" });
};

export const deleteOfficeController = async (req, res) => {
  const { id } = validate(res, officeIdSchema, req.params) || {};
  if (!id) return;

  const success = await deleteOffice(id);
  if (!success) {
    return res.status(404).json({ message: "Office not found" });
  }

  if (req.user?.id) {
    await logActivityController({
      databaseId: req.user.id,
      action: "DELETE_OFFICE",
      targetType: "OFFICE",
      targetId: id,
      description: "Deleted an office"
    });
  }

  res.status(200).json({ message: "Office deleted successfully" });
};

export const getOfficesListController = async (req, res) => {
  const offices = await fetchOrFail(res, getOfficesList, [], "Offices not found");
  if (!offices) return;

  res.status(200).json(offices);
};

export const getOfficeQrController = async (req, res) => {
  const data = validate(res, getOfficeQrSchema, req.params);
  if (!data) return;
  
  const { officeId } = data;

  const timestamp = Date.now();

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${officeId}|${timestamp}`)
    .digest("hex");

  const payload = {
    o: officeId,
    s: signature,
    t: timestamp
  };

  return res.status(200).json(payload);
};

export const getOfficeController = async (req, res) => {
  const { id } = validate(res, officeIdSchema, req.params) || {};
  if (!id) return;

  const office = await fetchOrFail(res, getOfficeById, [id], "Office not found");
  if (!office) return;

  res.status(200).json(office);
};

export const updateOfficeController = async (req, res) => {
  const { id } = validate(res, officeIdSchema, req.params) || {};
  if (!id) return;

  const data = validate(res, updateOfficeSchema, req.body);
  if (!data) return;

  const success = await updateOffice(id, data);
  if (!success) {
    return res.status(404).json({ message: "Office not found or no changes made" });
  }

  if (req.user?.id) {
    await logActivityController({
      databaseId: req.user.id,
      action: "UPDATE_OFFICE",
      targetType: "OFFICE",
      targetId: id,
      description: `Updated office details`
    });
  }

  res.status(200).json({ message: "Office updated successfully" });
};