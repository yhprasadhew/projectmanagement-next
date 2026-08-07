import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_change_me_in_prod";
export const authenticateCognitoToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
    // --- Mock Authentication Mode (for local testing / compatibility with seed mock tokens) ---
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
        }
        catch (error) {
            res.status(500).json({ message: "Database error in mock authentication" });
            return;
        }
    }
    // --- Real JWT Token Verification ---
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
            teamId: decoded.teamId,
        };
        next();
    }
    catch (error) {
        console.error("JWT verification failed:", error);
        res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};
//# sourceMappingURL=cognitoAuth.js.map