import express from "express";
import { deleteOfficeController, getOfficesListController, getOfficeQrController, getOfficeController, createOfficeController, updateOfficeController } from "../controllers/office.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.delete("/:id", verifyToken, asyncHandler(deleteOfficeController));
router.get("/", asyncHandler(getOfficesListController));
router.get("/:id", verifyToken, asyncHandler(getOfficeController));
router.get("/:officeId/qr", verifyToken, asyncHandler(getOfficeQrController));
router.patch("/:id", verifyToken, asyncHandler(updateOfficeController));
router.post("/", verifyToken, asyncHandler(createOfficeController));

export default router;