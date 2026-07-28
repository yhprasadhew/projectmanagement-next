import type { Request, Response, NextFunction } from "express";
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        username: string;
        email: string;
        role: string;
        teamId: number | null;
    };
}
export declare const authenticateCognitoToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cognitoAuth.d.ts.map