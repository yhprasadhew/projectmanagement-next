"use client";

import React, { useState } from "react";
import ProjectHeader from "@/app/projects/[id]/ProjectHeader";
import BoardView from "@/components/board/BoardView";
import ListView from "@/components/board/ListView";
import TimelineView from "@/components/board/TimelineView";
import TableView from "@/components/board/TableView";
import BacklogView from "@/components/board/BacklogView";
import { useGetProjectQuery } from "@/state/api";
import { Loader2 } from "lucide-react";
import ModalNewTask from "@/components/ModalNewTask";

type Props = {
  params: Promise<{ id: string }>;
};

const Page = ({ params }: Props) => {
  const { id } = React.use(params);
  const projectId = Number(id);

  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const { data: project, isLoading, isError } = useGetProjectQuery(projectId, {
    skip: Number.isNaN(projectId),
  });

  if (Number.isNaN(projectId)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-900/10">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Invalid project ID.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-900/10">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Project not found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isModalNewTaskOpen={isModalNewTaskOpen}
        setIsModalNewTaskOpen={setIsModalNewTaskOpen}
      />

      {activeTab === "Board" && <BoardView projectId={projectId} />}
      {activeTab === "List" && <ListView projectId={projectId} />}
      {activeTab === "Timeline" && <TimelineView projectId={projectId} />}
      {activeTab === "Table" && <TableView projectId={projectId} />}
      {activeTab === "Backlog" && <BacklogView projectId={projectId} />}

      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        projectId={projectId}
      />
    </div>
  );
};

export default Page;
