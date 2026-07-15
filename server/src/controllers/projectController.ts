import type { Request, Response } from "express";
import { prisma } from "../prisma.js";

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving projects",
    });
  }
};