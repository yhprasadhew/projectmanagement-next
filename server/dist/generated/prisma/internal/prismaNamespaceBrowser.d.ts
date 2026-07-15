import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly Team: "Team";
    readonly Project: "Project";
    readonly ProjectTeam: "ProjectTeam";
    readonly User: "User";
    readonly Task: "Task";
    readonly Attachment: "Attachment";
    readonly Comment: "Comment";
    readonly TaskAssignment: "TaskAssignment";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const TeamScalarFieldEnum: {
    readonly id: "id";
    readonly teamName: "teamName";
    readonly productOwnerUserId: "productOwnerUserId";
    readonly projectManagerUserId: "projectManagerUserId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TeamScalarFieldEnum = (typeof TeamScalarFieldEnum)[keyof typeof TeamScalarFieldEnum];
export declare const ProjectScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly startDate: "startDate";
    readonly endDate: "endDate";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ProjectScalarFieldEnum = (typeof ProjectScalarFieldEnum)[keyof typeof ProjectScalarFieldEnum];
export declare const ProjectTeamScalarFieldEnum: {
    readonly id: "id";
    readonly teamId: "teamId";
    readonly projectId: "projectId";
};
export type ProjectTeamScalarFieldEnum = (typeof ProjectTeamScalarFieldEnum)[keyof typeof ProjectTeamScalarFieldEnum];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly cognitoId: "cognitoId";
    readonly username: "username";
    readonly profilePictureUrl: "profilePictureUrl";
    readonly teamId: "teamId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const TaskScalarFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly description: "description";
    readonly status: "status";
    readonly priority: "priority";
    readonly tags: "tags";
    readonly startDate: "startDate";
    readonly dueDate: "dueDate";
    readonly projectId: "projectId";
    readonly authorUserId: "authorUserId";
    readonly assignedUserId: "assignedUserId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TaskScalarFieldEnum = (typeof TaskScalarFieldEnum)[keyof typeof TaskScalarFieldEnum];
export declare const AttachmentScalarFieldEnum: {
    readonly id: "id";
    readonly fileURL: "fileURL";
    readonly fileName: "fileName";
    readonly taskId: "taskId";
    readonly uploadedById: "uploadedById";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AttachmentScalarFieldEnum = (typeof AttachmentScalarFieldEnum)[keyof typeof AttachmentScalarFieldEnum];
export declare const CommentScalarFieldEnum: {
    readonly id: "id";
    readonly text: "text";
    readonly taskId: "taskId";
    readonly userId: "userId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CommentScalarFieldEnum = (typeof CommentScalarFieldEnum)[keyof typeof CommentScalarFieldEnum];
export declare const TaskAssignmentScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly taskId: "taskId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TaskAssignmentScalarFieldEnum = (typeof TaskAssignmentScalarFieldEnum)[keyof typeof TaskAssignmentScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map