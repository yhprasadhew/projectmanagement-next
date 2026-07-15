import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js"

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // <-- ADD THIS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

// Routes
app.get("/", (req, res) => {
  res.send("hello this home route");
});

app.use("/projects", projectRoutes);

app.use("/tasks", taskRoutes);


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});