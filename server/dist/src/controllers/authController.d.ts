import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/cognitoAuth.js";
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const getCurrentUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const setPassword: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map