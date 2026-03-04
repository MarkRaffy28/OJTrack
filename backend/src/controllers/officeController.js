const officeModel = require("../models/officeModel");

exports.getOfficesList = async ( res) => {
  try {
    const offices = await officeModel.getOfficesList();
    res.status(200).json(offices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}