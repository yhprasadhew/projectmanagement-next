"use client";

import React, { useState } from "react";
import ProjectHeader from "@/app/projects/[id]/ProjectHeader";

type Props = {
  params: {
    id: string;
  };
};

const Page = ({ params }: Props) => {
  const { id } = params;

  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  return (
    <div>
      <ProjectHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isModalNewTaskOpen={isModalNewTaskOpen}
        setIsModalNewTaskOpen={setIsModalNewTaskOpen}
      />

      <p>Project ID: {id}</p>
    </div>
  );
};

export default Page;