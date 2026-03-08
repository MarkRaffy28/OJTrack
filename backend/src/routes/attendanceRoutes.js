const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.get("/today", attendanceController.getTodayAttendance);
router.post("/scan", attendanceController.scanAttendance);

module.exports = router;
  