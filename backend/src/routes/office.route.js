import express from "express";
import { getOfficesList, getOfficeQr } from "../controllers/office.controller.js";

const router = express.Router();

router.get("/list", getOfficesList);
router.get("/qr/:officeId", getOfficeQr);

export default router;