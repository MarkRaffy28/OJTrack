const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register/student", authController.registerStudent);
router.post("/register/supervisor", authController.registerSupervisor);

module.exports = router;
