import crypto from "crypto";
import { getOfficesList as _getOfficesList } from "../models/office.model.js";

const SECRET = process.env.QR_SECRET;

export const getOfficesList = async ( req, res) => {
  try {
    const offices = await _getOfficesList();
    res.status(200).json(offices);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const getOfficeQr = async (req, res) => {
  try {
    const { officeId } = req.params;
    if (!officeId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

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

  } catch (err) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};