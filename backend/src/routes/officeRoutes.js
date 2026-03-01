const express = require("express");
const router = express.Router();
const officeController = require("../controllers/officeController");

router.post("/list", officeController.getOfficesList);

module.exports = router;
