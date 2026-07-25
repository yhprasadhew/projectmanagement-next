import { Router } from "express";
import { getTasks, createTask, updateTaskStatus, deleteTask, updateTask } from "../controllers/taskController.js";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
