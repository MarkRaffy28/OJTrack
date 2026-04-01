import express from "express";
import cors from "cors";

import attendanceRoutes from "./routes/attendance.route.js";
import authRoutes from "./routes/auth.route.js";
import officeRoutes from "./routes/office.route.js";
import reportRoutes from "./routes/report.route.js";
import userRoutes from "./routes/user.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

export default app;
