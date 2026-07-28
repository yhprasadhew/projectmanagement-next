import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { isProjectManager } from "../lib/roles.js";

type AuthUser = {
  userId: number;
  role: string;
};

const getAuthUser = (req: Request): AuthUser | undefined => (req as any).user;

const isUserAuthorizedForProject = async (
  userId: number,
  role: string,
  projectId: number
): Promise<boolean> => {
  if (isProjectManager(role)) return true;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          id: userId,
        },
      },
    },
  });

  return !!project;
};

export const getTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId, mine } = req.query;
  const user = getAuthUser(req);

  try {
    let where: Record<string, unknown> = {};

    if (projectId) {
      where.projectId = Number(projectId);
    }

    if (user && !isProjectManager(user.role)) {
      where.assignedUserId = user.userId;
    } else if (user && mine === "true") {
      where.assignedUserId = user.userId;
    }

    if (projectId && user && !isProjectManager(user.role)) {
      const authorized = await isUserAuthorizedForProject(
        user.userId,
        user.role,
        Number(projectId)
      );
      if (!authorized) {
        res.status(403).json({ message: "Forbidden: You are not a member of this project" });
        return;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        author: true,
        assignee: true,
        comments: { include: { user: true }, orderBy: { createdAt: "desc" } },
        attachments: { include: { uploadedBy: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving tasks",
    });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;
  const user = getAuthUser(req);

  try {
    if (!user || !isProjectManager(user.role)) {
      res.status(403).json({ message: "Forbidden: Only project managers can create tasks" });
      return;
    }

    if (projectId) {
      const authorized = await isUserAuthorizedForProject(
        user.userId,
        user.role,
        Number(projectId)
      );
      if (!authorized) {
        res.status(403).json({ message: "Forbidden: You are not a member of this project" });
        return;
      }
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "Todo",
        priority,
        tags,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(projectId && { projectId: Number(projectId) }),
        authorUserId: authorUserId ? Number(authorUserId) : user.userId,
        ...(assignedUserId && { assignedUserId: Number(assignedUserId) }),
      },
      include: {
        author: true,
        assignee: true,
      },
    });

    if (assignedUserId && projectId) {
      const assigneeId = Number(assignedUserId);
      await prisma.project.update({
        where: { id: Number(projectId) },
        data: {
          members: { connect: { id: assigneeId } },
        },
      });
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating task",
    });
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  const user = getAuthUser(req);

  try {
    const id = Number(taskId);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (isProjectManager(user.role)) {
      if (task.projectId) {
        const authorized = await isUserAuthorizedForProject(
          user.userId,
          user.role,
          task.projectId
        );
        if (!authorized) {
          res.status(403).json({ message: "Forbidden" });
          return;
        }
      }
    } else {
      if (task.assignedUserId !== user.userId) {
        res.status(403).json({ message: "Forbidden: You can only update tasks assigned to you" });
        return;
      }

      const allowedDevStatuses = ["Working Progress", "Under Review", "Completed"];
      if (!allowedDevStatuses.includes(status)) {
        res.status(403).json({
          message: "Developers can only move tasks to Working Progress, Under Review, or Completed",
        });
        return;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignee: true,
        comments: { include: { user: true } },
        attachments: true,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating task status",
    });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const user = getAuthUser(req);

  try {
    if (!user || !isProjectManager(user.role)) {
      res.status(403).json({ message: "Forbidden: Only project managers can delete tasks" });
      return;
    }

    const id = Number(taskId);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await prisma.taskAssignment.deleteMany({ where: { taskId: id } });
    await prisma.comment.deleteMany({ where: { taskId: id } });
    await prisma.attachment.deleteMany({ where: { taskId: id } });

    const deletedTask = await prisma.task.delete({
      where: { id },
    });

    res.json({ message: "Task deleted successfully", task: deletedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting task",
    });
  }
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    authorUserId,
    assignedUserId,
  } = req.body;
  const user = getAuthUser(req);

  try {
    if (!user || !isProjectManager(user.role)) {
      res.status(403).json({ message: "Forbidden: Only project managers can edit tasks" });
      return;
    }

    const id = Number(taskId);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority !== undefined && { priority }),
        ...(tags !== undefined && { tags }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(authorUserId !== undefined && {
          authorUserId: authorUserId ? Number(authorUserId) : null,
        }),
        ...(assignedUserId !== undefined && {
          assignedUserId: assignedUserId ? Number(assignedUserId) : null,
        }),
      },
      include: { assignee: true, author: true },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating task",
    });
  }
};

export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { text } = req.body;
  const user = getAuthUser(req);

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!text?.trim()) {
    res.status(400).json({ message: "Comment text is required" });
    return;
  }

  try {
    const id = Number(taskId);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const isAssignee = task.assignedUserId === user.userId;
    const isPm = isProjectManager(user.role);

    if (!isPm && !isAssignee) {
      res.status(403).json({ message: "Forbidden: You cannot comment on this task" });
      return;
    }

    const newComment = await prisma.comment.create({
      data: {
        text: text.trim(),
        taskId: id,
        userId: user.userId,
      },
      include: {
        user: true,
      },
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating comment",
    });
  }
};
