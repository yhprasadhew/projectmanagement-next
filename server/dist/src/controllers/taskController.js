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
export const createTask = async (req, res) => {
    const { title, description, status, priority, tags, startDate, dueDate, projectId, authorUserId, assignedUserId, } = req.body;
    try {
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
    try {
        const updatedTask = await prisma.task.update({
            where: { id: Number(taskId) },
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
//# sourceMappingURL=taskController.js.map