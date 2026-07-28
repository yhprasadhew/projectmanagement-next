import { prisma } from "../prisma.js";
export const getTasks = async (req, res) => {
    const { projectId } = req.query;
    try {
        const tasks = await prisma.task.findMany({
            where: {
                ...(projectId ? { projectId: Number(projectId) } : {}),
            },
            include: {
                author: true,
                assignee: true,
                comments: true,
                attachments: true,
            },
        });
        res.json(tasks);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error retrieving tasks",
        });
    }
};
const isUserAuthorizedForProject = async (userId, role, projectId) => {
    if (role === "PROJECT_LEADER")
        return true;
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
export const createTask = async (req, res) => {
    const { title, description, status, priority, tags, startDate, dueDate, projectId, authorUserId, assignedUserId, } = req.body;
    const user = req.user;
    try {
        if (user) {
            const authorized = await isUserAuthorizedForProject(user.userId, user.role, Number(projectId));
            if (!authorized) {
                res.status(403).json({ message: "Forbidden: You are not a member of this project" });
                return;
            }
        }
        const newTask = await prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                tags,
                ...(startDate && { startDate: new Date(startDate) }),
                ...(dueDate && { dueDate: new Date(dueDate) }),
                ...(projectId && { projectId: Number(projectId) }),
                ...(authorUserId && { authorUserId: Number(authorUserId) }),
                ...(assignedUserId && { assignedUserId: Number(assignedUserId) }),
            },
        });
        res.status(201).json(newTask);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error creating task",
        });
    }
};
export const updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    const user = req.user;
    try {
        const id = Number(taskId);
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        if (user && task.projectId) {
            const authorized = await isUserAuthorizedForProject(user.userId, user.role, task.projectId);
            if (!authorized) {
                res.status(403).json({ message: "Forbidden: You are not a member of this project" });
                return;
            }
        }
        const updatedTask = await prisma.task.update({
            where: { id },
            data: { status },
        });
        res.json(updatedTask);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error updating task status",
        });
    }
};
export const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const user = req.user;
    try {
        const id = Number(taskId);
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        if (user && task.projectId) {
            const authorized = await isUserAuthorizedForProject(user.userId, user.role, task.projectId);
            if (!authorized) {
                res.status(403).json({ message: "Forbidden: You are not a member of this project" });
                return;
            }
        }
        await prisma.taskAssignment.deleteMany({ where: { taskId: id } });
        await prisma.comment.deleteMany({ where: { taskId: id } });
        await prisma.attachment.deleteMany({ where: { taskId: id } });
        const deletedTask = await prisma.task.delete({
            where: { id },
        });
        res.json({ message: "Task deleted successfully", task: deletedTask });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error deleting task",
        });
    }
};
export const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority, tags, startDate, dueDate, points, authorUserId, assignedUserId } = req.body;
    const user = req.user;
    try {
        const id = Number(taskId);
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        if (user && task.projectId) {
            const authorized = await isUserAuthorizedForProject(user.userId, user.role, task.projectId);
            if (!authorized) {
                res.status(403).json({ message: "Forbidden: You are not a member of this project" });
                return;
            }
        }
        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(status && { status }),
                ...(priority !== undefined && { priority }),
                ...(tags !== undefined && { tags }),
                ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
                ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
                ...(points !== undefined && { points: points ? Number(points) : null }),
                ...(authorUserId !== undefined && { authorUserId: authorUserId ? Number(authorUserId) : null }),
                ...(assignedUserId !== undefined && { assignedUserId: assignedUserId ? Number(assignedUserId) : null }),
            },
        });
        res.json(updatedTask);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error updating task",
        });
    }
};
//# sourceMappingURL=taskController.js.map