import { Router } from "express";
import {
  createProject,
  getProjectById,
  getProjects,
  deleteProject,
  addProjectMember,
  getProjectMembers,
} from "../controllers/projectController.js";

const router = Router();

router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.post("/", createProject);
router.delete("/:projectId", deleteProject);
router.get("/:projectId/members", getProjectMembers);
router.post("/:projectId/members", addProjectMember);

export default router;

