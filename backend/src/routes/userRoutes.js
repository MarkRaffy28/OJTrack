const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/exists/username/:username", userController.checkUsername);
router.get("/exists/user_id/:userId", userController.checkUserId);
router.get("/exists/email/:email", userController.checkEmail);
router.get("/fetch/student/:databaseId", userController.fetchStudentInformation);
router.get("/fetch/student/ojt/:databaseId", userController.fetchStudentOjts);

module.exports = router;
