const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const officeRoutes = require("./routes/officeRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
