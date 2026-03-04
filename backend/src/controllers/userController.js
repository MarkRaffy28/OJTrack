const userModel = require("../models/userModel");

exports.checkUsername = async (req, res) => {
  const { username } = req.body;

  try {
    const existingUser = await userModel.findByUsername(username);

    if (existingUser) {
      return res.status(200).json({
        available: false,
        message: "Username is already taken"
      });
    }

    return res.status(200).json({
      available: true,
      message: "Username is available"
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.checkUserId = async (req, res) => {
  const { userId } = req.body;

  try {
    const existingUser = await userModel.findByUserId(userId);

    if (existingUser) {
      return res.status(200).json({
        available: false,
        message: "User ID is already taken"
      });
    }

    return res.status(200).json({
      available: true,
      message: "User ID is available"
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await userModel.findByEmail(email);

    if (existingUser) {
      return res.status(200).json({
        available: false,
        message: "Email is already taken"
      });
    }

    return res.status(200).json({
      available: true,
      message: "Email is available"
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.fetchStudentInformation = async (req, res) => {
  const { databaseId } = req.body;

  try {
    const student = await userModel.fetchStudentInformation(databaseId);

    if (!student) {
      res.status(404).json({
        message: "Student not found"
      })
    }

    return res.status(200).json(student);

  } catch(error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}