import express from "express";
import { getOfficesListController, getOfficeQrController } from "../controllers/office.controller.js";

const router = express.Router();

router.get("/", getOfficesListController);
router.get("/qr/:officeId", getOfficeQrController);

export default router;