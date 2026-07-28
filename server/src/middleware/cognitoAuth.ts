import type { Request, Response, NextFunction } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { prisma } from "../prisma.js";

const userPoolId = process.env.COGNITO_USER_POOL_ID || "";
const clientId = process.env.COGNITO_CLIENT_ID || "";

let verifier: any = null;

if (userPoolId && clientId && !userPoolId.startsWith("mock")) {
  try {
    verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: "id", // ID token contains email and custom properties
      clientId,
    });
  } catch (error) {
    console.error("Failed to initialize CognitoJwtVerifier:", error);
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    email: string;
    role: string;
    teamId: number | null;
  };
}

export const authenticateCognitoToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  // --- Mock Authentication Mode (for local testing without active AWS configuration) ---
  if (!verifier) {
    if (token.startsWith("mock-token-")) {
      const username = token.replace("mock-token-", "");
      try {
        const dbUser = await prisma.user.findUnique({
          where: { username },
        });

        if (!dbUser) {
          res.status(404).json({ message: `Mock user "${username}" not found` });
          return;
        }

        req.user = {
          userId: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
          role: dbUser.role,
          teamId: dbUser.teamId,
        };
        next();
        return;
      } catch (error) {
        res.status(500).json({ message: "Database error in mock authentication" });
        return;
      }
    }

    res.status(401).json({
      message: "AWS Cognito is not configured. Use a mock token (e.g., Bearer mock-token-BobSmith) for local testing.",
    });
    return;
  }

  // --- Real AWS Cognito Token Verification ---
  try {
    const payload = await verifier.verify(token);
    const cognitoId = payload.sub as string;
    const email = ((payload.email as string) || `${payload["cognito:username"] || "user"}@example.com`) as string;
    const username = ((payload["cognito:username"] as string) || email.split("@")[0]) as string;

    let dbUser = await prisma.user.findUnique({
      where: { cognitoId },
    });

    if (!dbUser) {
      // Look up user by email to link profile added by project managers
      dbUser = await prisma.user.findUnique({
        where: { email },
      });

      if (dbUser) {
        // Link this existing database profile to Cognito identity sub
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { cognitoId },
        });
      } else {
        // Auto-create user profile if it doesn't exist
        dbUser = await prisma.user.create({
          data: {
            cognitoId,
            username,
            email,
            role: "USER",
          },
        });
      }
    }

    req.user = {
      userId: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
      teamId: dbUser.teamId,
    };
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(403).json({ message: "Forbidden: Invalid Cognito token" });
  }
};
