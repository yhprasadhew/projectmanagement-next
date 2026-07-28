import React, { useState, useEffect } from "react";
import { 
  useGetProjectMembersQuery, 
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation
} from "@/state/api";
import { Loader2, Plus, Mail, User, Briefcase, X, UserCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  projectId: number;
};

export default function ProjectMembersView({ projectId }: Props) {
  const { data: members, isLoading, isError, refetch } = useGetProjectMembersQuery(projectId);
  const [addMember, { isLoading: isAdding }] = useAddProjectMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveProjectMemberMutation();

  const handleRemoveMember = async (userId: number) => {
    if (confirm("Are you sure you want to remove this member from the project? Any tasks assigned to them will be unassigned.")) {
      try {
        await removeMember({ projectId, userId }).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to remove member:", err);
      }
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("Developer");
  const [isLeader, setIsLeader] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === "Project Leader" || parsed.role === "PROJECT_LEADER") {
          setIsLeader(true);
        }
      } catch (e) {}
    }
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await addMember({
        projectId,
        email,
        username: name,
        position,
      }).unwrap();
      
      setMessage("Member added successfully!");
      setEmail("");
      setName("");
      setPosition("Developer");
      
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage("");
        refetch();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to add member. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-900/10">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Failed to load project members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-150">
            Project Members
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Active staff members collaborating on this project
          </p>
        </div>

        {isLeader && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-[1.02]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Members Grid */}
      {members?.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center dark:border-stroke-dark">
          <p className="text-sm text-gray-500 dark:text-gray-455">
            No team members have been added to this project yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members?.map((member) => {
            const initial = member.username.charAt(0).toUpperCase();
            
            // Badge color based on position
            const isDev = member.position?.toLowerCase().includes("dev") || false;
            const isDesigner = member.position?.toLowerCase().includes("design") || false;
            const isAnalyst = member.position?.toLowerCase().includes("anal") || false;

            return (
              <div 
                key={member.id}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary flex flex-col items-center text-center group"
              >
                {isLeader && (
                  <button
                    type="button"
                    disabled={isRemoving}
                    onClick={() => member.id !== undefined && handleRemoveMember(member.id)}
                    className="absolute top-3 right-3 p-1.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
                    title="Remove Member from Project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                {/* Colored Avatar bubble */}
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white text-xl font-bold flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {initial}
                </div>

                <h3 className="mt-4 font-bold text-gray-800 dark:text-gray-100 truncate w-full px-2">
                  {member.username}
                </h3>
                
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate w-full px-2">
                  {member.email}
                </p>

                {/* Role badge */}
                <span className={cn(
                  "mt-4 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide border",
                  isDev && "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400",
                  isDesigner && "bg-pink-50 border-pink-100 text-pink-700 dark:bg-pink-950/20 dark:border-pink-900/30 dark:text-pink-400",
                  isAnalyst && "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400",
                  !isDev && !isDesigner && !isAnalyst && "bg-slate-50 border-slate-100 text-slate-700 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-400"
                )}>
                  {member.position || "Developer"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-stroke-dark dark:bg-dark-secondary">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-stroke-dark mb-5">
              <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                <UserCheck className="h-5 w-5 text-blue-500" />
                Add Project Member
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-450 hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {message && (
              <div className="mb-4 rounded-xl bg-blue-50/50 p-3.5 text-center text-xs font-semibold text-blue-700 dark:bg-blue-950/10 dark:text-blue-400">
                {message}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Member Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Jones"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="alicejones@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Project Role / Position</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Project Manager">Project Manager</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-650 hover:bg-gray-50 dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-300 dark:hover:bg-dark-tertiary/75"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isAdding ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
