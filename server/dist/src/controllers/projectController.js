import { prisma } from "../prisma.js";
export const getProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany();
        res.json(projects);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error retrieving projects",
        });
    }
};
export const getProjectById = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await prisma.project.findUnique({
            where: { id: Number(projectId) },
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        res.json(project);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error retrieving project",
        });
    }
};
export const createProject = async (req, res) => {
    const { name, description, startDate, endDate } = req.body;
    try {
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                startDate,
                endDate,
            },
        });
        res.status(201).json(newProject);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error creating project",
        });
    }
};
//# sourceMappingURL=projectController.js.map