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

    const existingEmail = await userModel.findByEmail(value.email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const existingUserId = await userModel.findByUserId(value.userId);
    if (existingUserId) {
      return res.status(409).json({ message: "User ID already exists" });
    }

    value.password = await bcrypt.hash(value.password, 10);
    const userId = await userModel.createStudentUser(value);

    res.status(201).json({
      message: "User registered successfully",
      userId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.registerSupervisor = async (req, res) => {
  const { error, value } = userValidator.supervisorRegistrationSchema.validate(req.body);

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
    
    const existingEmail = await userModel.findByEmail(value.email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const existingUserId = await userModel.findByUserId(value.userId);
    if (existingUserId) {
      return res.status(409).json({ message: "User ID already exists" });
    }

    value.password = await bcrypt.hash(value.password, 10);
    const userId = await userModel.createSupervisorUser(value);

    res.status(201).json({
      message: "User registered successfully",
      userId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}