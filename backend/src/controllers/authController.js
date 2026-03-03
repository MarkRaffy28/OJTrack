require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const authValidator = require("../validators/authValidator");
const { treeifyError } = require("zod");

exports.login = async (req, res) => {
  const parsed = authValidator.loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json( treeifyError(parsed.error) );
  }
  const { username, password } = parsed.data;

  try {
    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.registerStudent = async (req, res) => {
  const parsed = authValidator.studentRegistrationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json( treeifyError(parsed.error) );
  }
  const { username, password, userId, email } = parsed.data;

  try {
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const existingUserId = await userModel.findByUserId(userId);
    if (existingUserId) {
      return res.status(409).json({ message: "User ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUserId = await userModel.createStudentUser({
      ...parsed.data,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      newUserId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.registerSupervisor = async (req, res) => {
  const parsed = authValidator.supervisorRegistrationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json( treeifyError(parsed.error) );
  }
  const { username, password, userId, email } = parsed.data;

  try {
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const existingUserId = await userModel.findByUserId(userId);
    if (existingUserId) {
      return res.status(409).json({ message: "User ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUserId = await userModel.createSupervisorUser({
      ...parsed.data,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      newUserId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}