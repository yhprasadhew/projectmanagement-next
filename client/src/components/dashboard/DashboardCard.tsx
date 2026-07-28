import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentClass: string;
};

const DashboardCard = ({ title, value, icon, accentClass }: Props) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary transition-shadow hover:shadow-md">
      {/* Decorative Accent Background Glow */}
      <div className={cn("absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10 blur-xl", accentClass)} />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {value}
          </h3>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm", accentClass)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;


//node dist/src/index.js