const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register/student", authController.registerStudent);

module.exports = router;
