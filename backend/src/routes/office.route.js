import express from "express";
import { getOfficesListController, getOfficeQrController } from "../controllers/office.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", asyncHandler(getOfficesListController));
router.get("/:officeId/qr", verifyToken, asyncHandler(getOfficeQrController));

export default router;