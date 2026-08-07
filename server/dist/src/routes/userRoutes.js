import { Router } from "express";
import { prisma } from "../prisma.js";
const router = Router();
router.get("/", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                position: true,
                profilePictureUrl: true,
                teamId: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
});
export default router;
//# sourceMappingURL=userRoutes.js.map