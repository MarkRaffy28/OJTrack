import { logActivityController } from "./activity.controller.js";
import { validate } from "../helpers/validate.helper.js";
import { getSettings, updateSettings } from "../models/settings.model.js";
import { updateSettingsSchema } from "../validators/settings.validator.js";

export const getSettingsController = async (req, res) => {
  const settings = await getSettings();
  if (!settings) return;

  res.status(200).json(settings);
};

export const updateSettingsController = async (req, res) => {
  const data = validate(res, updateSettingsSchema, req.body);
  if (!data) return;

  await updateSettings(data);

  if (req.user?.id) {
    await logActivityController({
      databaseId: req.user.id,
      action: "UPDATE_SETTINGS",
      targetType: "SYSTEM",
      description: "Updated system settings",
    });
  }

  res.status(200).json({ message: "Settings updated successfully" });
};
