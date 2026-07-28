import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { authenticateCognitoToken } from "./middleware/cognitoAuth.js";
dotenv.config();
const app = express();
// Middleware — large limit for base64 file uploads in demo mode
app.use(express.json({ limit: "15mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
// Routes
app.get("/", (req, res) => {
    res.send("hello this home route");
});
app.use("/auth", authenticateCognitoToken, authRoutes);
app.use("/projects", authenticateCognitoToken, projectRoutes);
app.use("/tasks", authenticateCognitoToken, taskRoutes);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map