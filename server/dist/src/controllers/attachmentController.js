import { prisma } from "../prisma.js";
import { isProjectManager } from "../lib/roles.js";
const canAccessTask = async (userId, role, taskId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { projectId: true, assignedUserId: true },
    });
    if (!task)
        return false;
    if (isProjectManager(role))
        return true;
    if (task.assignedUserId === userId)
        return true;
    if (task.projectId) {
        const member = await prisma.project.findFirst({
            where: {
                id: task.projectId,
                members: { some: { id: userId } },
            },
        });
        return !!member;
    }
    return false;
};
export const createAttachment = async (req, res) => {
    const { taskId } = req.params;
    const { fileName, fileURL } = req.body;
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (!fileName || !fileURL) {
        res.status(400).json({ message: "fileName and fileURL are required" });
        return;
    }
    try {
        const id = Number(taskId);
        const allowed = await canAccessTask(user.userId, user.role, id);
        if (!allowed) {
            res.status(403).json({ message: "Forbidden: You cannot upload to this task" });
            return;
        }
        const attachment = await prisma.attachment.create({
            data: {
                fileName,
                fileURL,
                taskId: id,
                uploadedById: user.userId,
            },
            include: { uploadedBy: true },
        });
        res.status(201).json(attachment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error uploading attachment" });
    }
};
//# sourceMappingURL=attachmentController.js.map