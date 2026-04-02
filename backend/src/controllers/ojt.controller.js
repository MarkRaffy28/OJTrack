import { treeifyError } from "zod";
import { fetchStudentOjts } from "../models/ojt.model.js";
import { findUserByDatabaseId } from "../models/user.model.js";
import { fetchStudentOjtsSchema } from "../validators/ojt.validator.js";

export const fetchStudentOjtsController = async (req, res) => {
  try {
    const parsed = fetchStudentOjtsSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json(treeifyError(parsed.error));
    }
    const { databaseId } = parsed.data;

    const user = await findUserByDatabaseId(databaseId);
    if (!user) {
      return res.status(404).json({  message: "User not found" });
    }

    const studentOjts = await fetchStudentOjts(databaseId);
    if (!studentOjts) {
      return res.status(404).json({ message: "Student OJTs not found" });
    }

    return res.status(200).json(studentOjts);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}