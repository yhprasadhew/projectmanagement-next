import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/cognitoAuth.js";
import { prisma } from "../prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_change_me_in_prod";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { usernameOrEmail, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: usernameOrEmail, mode: "insensitive" } },
          { username: { equals: usernameOrEmail, mode: "insensitive" } },
        ]
      }
    });

    if (!user) {
      res.status(401).json({ message: "Invalid username/email or password" });
      return;
    }

    // Check password if it is set. If not, fallback to default "password123" for unhashed migration
    const isPasswordValid = user.password 
      ? await bcrypt.compare(password, user.password)
      : password === "password123";

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid username/email or password" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        position: user.position,
        profilePictureUrl: user.profilePictureUrl,
        teamId: user.teamId,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login error" });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ message: "Username or email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        cognitoId: `custom-jwt-${Date.now()}`, // unique fallback for compatibility
        role: "USER"
      }
    });

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration error" });
  }
};

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

export const setPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({
        message: "User profile not found. Please ask an Admin or Project Manager to invite you first.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password set successfully! You can now log in." });
  } catch (error) {
    console.error("Set password error:", error);
    res.status(500).json({ message: "Error setting password" });
  }
};
