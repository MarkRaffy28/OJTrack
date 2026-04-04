import express from "express";
import cors from "cors";

import activityRoutes from "./routes/activity.route.js";
import attendanceRoutes from "./routes/attendance.route.js";
import authRoutes from "./routes/auth.route.js";
import officeRoutes from "./routes/office.route.js";
import ojtsRoutes from "./routes/ojts.route.js";
import reportRoutes from "./routes/report.route.js";
import userRoutes from "./routes/user.route.js";
import supervisorRoutes from "./routes/supervisor.route.js";

const app = express();
const apiRouter = express.Router();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

apiRouter.use("/activities", activityRoutes);
apiRouter.use("/attendance", attendanceRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/offices", officeRoutes);
apiRouter.use("/ojts", ojtsRoutes);
apiRouter.use("/reports", reportRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/supervisor", supervisorRoutes);

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;