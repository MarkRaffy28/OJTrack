const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/exists/username", userController.checkUsername);
router.post("/exists/user_id", userController.checkUserId);
router.post("/exists/email", userController.checkEmail);
router.post("/fetch/student", userController.fetchStudentInformation);

module.exports = router;
