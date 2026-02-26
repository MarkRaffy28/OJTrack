const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const userValidator = require("../validators/userValidator");

exports.registerStudent = async (req, res) => {
  const { error, value } = userValidator.studentRegistrationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  try {
    const existingUser = await userModel.findByUsername(value.username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    value.password = await bcrypt.hash(value.password, 10);
    const userID = await userModel.createStudentUser(value);

    res.status(201).json({
      message: "User registered successfully",
      userID
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}