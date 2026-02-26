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