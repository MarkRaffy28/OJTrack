const crypto = require("crypto");
const officeModel = require("../models/officeModel");

const SECRET = process.env.QR_SECRET;

exports.getOfficesList = async ( req, res) => {
  try {
    const offices = await officeModel.getOfficesList();
    res.status(200).json(offices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.getOfficeQr = async (req, res) => {
  const { officeId } = req.params;

  try {
    if (!officeId) {
      return res.status(400).json({
        message: "officeId is required"
      });
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

    return res.json(payload);

  } catch (err) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};