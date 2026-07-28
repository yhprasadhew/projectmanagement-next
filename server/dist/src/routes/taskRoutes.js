import { Router } from "express";
import { getTasks, createTask, updateTaskStatus, deleteTask, updateTask, createComment } from "../controllers/taskController.js";
import { createAttachment } from "../controllers/attachmentController.js";
const router = Router();
router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);
router.post("/:taskId/comments", createComment);
router.post("/:taskId/attachments", createAttachment);
export default router;
//# sourceMappingURL=taskRoutes.js.map