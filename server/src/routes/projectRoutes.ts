import { Router } from "express";
import {
  createProject,
  getProjectById,
  getProjects,
  deleteProject,
} from "../controllers/projectController.js";

const router = Router();

router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.post("/", createProject);
router.delete("/:projectId", deleteProject);


export default router;

