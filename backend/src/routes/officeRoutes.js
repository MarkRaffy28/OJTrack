const express = require("express");
const router = express.Router();
const officeController = require("../controllers/officeController");

router.get("/list", officeController.getOfficesList);
router.get("/qr/:officeId", officeController.getOfficeQr);

module.exports = router;
