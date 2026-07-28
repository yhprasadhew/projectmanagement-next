import type { Request, Response } from "express";
export declare const getProjects: (req: Request, res: Response) => Promise<void>;
export declare const getProjectById: (req: Request, res: Response) => Promise<void>;
export declare const createProject: (req: Request, res: Response) => Promise<void>;
export declare const deleteProject: (req: Request, res: Response) => Promise<void>;
export declare const addProjectMember: (req: Request, res: Response) => Promise<void>;
export declare const getProjectMembers: (req: Request, res: Response) => Promise<void>;
export declare const removeProjectMember: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=projectController.d.ts.map