import { db } from "../config/db.js";

export const getSettings = async () => {
  const [rows] = await db.query("SELECT setting_key, setting_value FROM settings");
  const settings = {};
  rows.forEach(r => {
    settings[r.setting_key] = r.setting_value;
  });
  return settings;
};

export const updateSettings = async (settings) => {
  const promises = Object.entries(settings).map(([key, value]) => {
    return db.query(
      "UPDATE settings SET setting_value = ? WHERE setting_key = ?",
      [value, key]
    );
  });
  await Promise.all(promises);
  return true;
};
