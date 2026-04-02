import crypto from "crypto";
import { getOfficesList } from "../models/office.model.js";
import { getOfficeQrSchema } from "../validators/office.validator.js";

const SECRET = process.env.QR_SECRET;


export const getOfficesListController = async ( req, res) => {
  try {
    const offices = await getOfficesList();
    res.status(200).json(offices);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const getOfficeQrController = async (req, res) => {
  try {
    const parsed = getOfficeQrSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json( treeifyError(parsed.error) );
    }
    const { officeId } = parsed.data;

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