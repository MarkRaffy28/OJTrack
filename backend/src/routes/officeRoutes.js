const express = require("express");
const router = express.Router();
const officeController = require("../controllers/officeController");

router.get("/list", officeController.getOfficesList);

module.exports = router;
