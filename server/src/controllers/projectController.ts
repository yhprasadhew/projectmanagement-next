import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import crypto from "crypto";
import { isProjectManager } from "../lib/roles.js";

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  try {
    let projects;
    if (user && user.role === "PROJECT_LEADER") {
      projects = await prisma.project.findMany();
    } else if (user) {
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: {
              id: user.userId,
            },
          },
        },
      });
    } else {
      projects = await prisma.project.findMany();
    }
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving projects",
    });
  }
};

export const getProjectById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  const user = (req as any).user;

  try {
    const id = Number(projectId);
    let project;

    if (user && user.role === "PROJECT_LEADER") {
      project = await prisma.project.findUnique({
        where: { id },
      });
    } else if (user) {
      project = await prisma.project.findFirst({
        where: {
          id,
          members: {
            some: {
              id: user.userId,
            },
          },
        },
      });
    } else {
      project = await prisma.project.findUnique({
        where: { id },
      });
    }

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving project",
    });
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, startDate, endDate } = req.body;
  const user = (req as any).user;

  try {
    if (!user || !isProjectManager(user.role)) {
      res.status(403).json({ message: "Forbidden: Only project managers can create projects" });
      return;
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        members: user
          ? {
              connect: { id: user.userId },
            }
          : undefined,
      },
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating project",
    });
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  const user = (req as any).user;

  if (!user || !isProjectManager(user.role)) {
    res.status(403).json({ message: "Forbidden: Only project managers can delete projects" });
    return;
  }

  try {
    const id = Number(projectId);

    // Check if project exists
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Find all tasks of this project to delete their related records
    const tasks = await prisma.task.findMany({ where: { projectId: id } });
    const taskIds = tasks.map((t) => t.id);

    if (taskIds.length > 0) {
      await prisma.taskAssignment.deleteMany({
        where: { taskId: { in: taskIds } },
      });
      await prisma.comment.deleteMany({
        where: { taskId: { in: taskIds } },
      });
      await prisma.attachment.deleteMany({
        where: { taskId: { in: taskIds } },
      });
    }

    // Delete tasks of the project
    await prisma.task.deleteMany({
      where: { projectId: id },
    });

    // Delete project teams
    await prisma.projectTeam.deleteMany({
      where: { projectId: id },
    });

    // Delete the project
    const deletedProject = await prisma.project.delete({
      where: { id },
    });

    res.json({ message: "Project deleted successfully", project: deletedProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting project",
    });
  }
};

export const addProjectMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  const { email, username, position } = req.body;
  const user = (req as any).user;

  if (!user || !isProjectManager(user.role)) {
    res.status(403).json({ message: "Forbidden: Only project managers can add members" });
    return;
  }

  try {
    const projId = Number(projectId);

    // 1. Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create a new user profile with a temporary cognitoId
      user = await prisma.user.create({
        data: {
          cognitoId: `temp-${crypto.randomUUID()}`,
          username: username || email.split("@")[0],
          email,
          role: "USER",
          position: position || "Developer",
        },
      });
    } else if (position) {
      // Update position for existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { position },
      });
    }

    // 2. Connect user to project members
    await prisma.project.update({
      where: { id: projId },
      data: {
        members: {
          connect: { id: user.id },
        },
      },
    });

    res.status(200).json({ message: "Member added to project successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding member to project" });
  }
};

export const getProjectMembers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
      include: {
        members: true,
      },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project.members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving project members" });
  }
};

export const removeProjectMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId, userId } = req.params;
  const user = (req as any).user;

  if (!user || !isProjectManager(user.role)) {
    res.status(403).json({ message: "Forbidden: Only project managers can remove members" });
    return;
  }

  try {
    const projId = Number(projectId);
    const uId = Number(userId);

    // Unassign tasks of this project currently assigned to this user
    await prisma.task.updateMany({
      where: {
        projectId: projId,
        assignedUserId: uId,
      },
      data: {
        assignedUserId: null,
      },
    });

    // Disconnect user from project members
    await prisma.project.update({
      where: { id: projId },
      data: {
        members: {
          disconnect: { id: uId },
        },
      },
    });

    res.status(200).json({ message: "Member removed from project successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing member from project" });
  }
};