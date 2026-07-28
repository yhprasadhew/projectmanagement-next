import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export interface User {
  id?: number;
  userId?: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  cognitoId?: string;
  teamId?: number;
  role?: string;
  position?: string;
}

export interface Comment {
  id: number;
  text: string;
  taskId: number;
  userId: number;
  createdAt?: string;
  user?: User;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
  uploadedBy?: User;
  createdAt?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId?: number;
  authorUserId?: number;
  assignedUserId?: number;
  createdAt?: string;
  updatedAt?: string;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Team {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      try {
        const { fetchAuthSession } = await import("aws-amplify/auth");
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
          return headers;
        }
      } catch (e) {
        // Fallback if Amplify is not configured/authenticated yet
      }

      const localToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (localToken) {
        headers.set("authorization", `Bearer ${localToken}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Projects", "Tasks", "Users", "Teams"],

  endpoints: (builder) => ({
    // =========================
    // GET PROJECTS
    // =========================
    getProjects: builder.query<Project[], void>({
      query: () => "projects",
      providesTags: ["Projects"],
    }),

    getProject: builder.query<Project, number>({
      query: (projectId) => `projects/${projectId}`,
      providesTags: (result) =>
        result ? [{ type: "Projects", id: result.id }] : ["Projects"],
    }),

    // =========================
    // GET TASKS
    // =========================
    getTasks: builder.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks?projectId=${projectId}`,

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Tasks" as const,
                id,
              })),
              { type: "Tasks", id: "LIST" },
            ]
          : [{ type: "Tasks", id: "LIST" }],
    }),

    // =========================
    // UPDATE TASK STATUS
    // =========================
    updateTaskStatus: builder.mutation<
      Task,
      {
        taskId: number;
        status: string;
      }
    >({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),

      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: "LIST" },
      ],
    }),

    updateTask: builder.mutation<Task, { taskId: number; task: Partial<Task> }>({
      query: ({ taskId, task }) => ({
        url: `tasks/${taskId}`,
        method: "PATCH",
        body: task,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: "LIST" },
      ],
    }),

    createTask: builder.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),

    deleteTask: builder.mutation<void, number>({
      query: (taskId) => ({
        url: `tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),

    createProject: builder.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),

    deleteProject: builder.mutation<void, number>({
      query: (projectId) => ({
        url: `projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),

    getTasksGlobal: builder.query<Task[], void>({
      query: () => "tasks",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Tasks" as const,
                id,
              })),
              { type: "Tasks", id: "LIST" },
            ]
          : [{ type: "Tasks", id: "LIST" }],
    }),

    getProjectMembers: builder.query<User[], number>({
      query: (projectId) => `projects/${projectId}/members`,
      providesTags: (result, error, projectId) => [{ type: "Users", id: `MEMBERS-${projectId}` }],
    }),

    addProjectMember: builder.mutation<
      User,
      { projectId: number; email: string; username: string; position?: string }
    >({
      query: ({ projectId, email, username, position }) => ({
        url: `projects/${projectId}/members`,
        method: "POST",
        body: { email, username, position },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Users", id: `MEMBERS-${projectId}` },
      ],
    }),

    createComment: builder.mutation<
      Comment,
      { taskId: number; text: string }
    >({
      query: ({ taskId, text }) => ({
        url: `tasks/${taskId}/comments`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: "LIST" },
      ],
    }),

    createAttachment: builder.mutation<
      Attachment,
      { taskId: number; fileName: string; fileURL: string }
    >({
      query: ({ taskId, fileName, fileURL }) => ({
        url: `tasks/${taskId}/attachments`,
        method: "POST",
        body: { fileName, fileURL },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateTaskMutation,
  useGetTasksGlobalQuery,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useCreateCommentMutation,
  useCreateAttachmentMutation,
} = api;

//