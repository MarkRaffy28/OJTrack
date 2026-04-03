import crypto from "crypto";
import { fetchOrFail } from "../helpers/resource.helper.js";
import { validate } from "../helpers/validate.helper.js";
import { getOfficesList } from "../models/office.model.js";
import { getOfficeQrSchema } from "../validators/office.validator.js";

const SECRET = process.env.QR_SECRET;


export const getOfficesListController = async ( req, res) => {
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