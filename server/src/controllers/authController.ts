import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/cognitoAuth.js";
import { prisma } from "../prisma.js";

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
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

    if (!dbUser) {
      res.status(404).json({ message: "User profile not found" });
      return;
    }

    res.json(dbUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching current user" });
  }
};
