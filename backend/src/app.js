import express from "express";
import cors from "cors";

import activityRoutes from "./routes/activity.route.js";
import attendanceRoutes from "./routes/attendance.route.js";
import authRoutes from "./routes/auth.route.js";
import officeRoutes from "./routes/office.route.js";
import ojtsRoutes from "./routes/ojts.route.js";
import reportRoutes from "./routes/report.route.js";
import userRoutes from "./routes/user.route.js";
import settingsRoutes from "./routes/settings.route.js";

const app = express();
const apiRouter = express.Router();

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "ngrok-skip-browser-warning",
    "X-Requested-With",
  ],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/uploads", (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning");
  next();
}, express.static("uploads"));

apiRouter.use("/activities", activityRoutes);
apiRouter.use("/attendance", attendanceRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/offices", officeRoutes);
apiRouter.use("/ojts", ojtsRoutes);
apiRouter.use("/reports", reportRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/settings", settingsRoutes);

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;