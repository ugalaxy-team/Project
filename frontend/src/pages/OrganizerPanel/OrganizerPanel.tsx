import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type RootState } from "../../store";
import { getAllTournaments } from "@/api/requests/getAllTournaments";
import { deleteTournament } from "@/api/requests/deleteTournament";
import { updateTournament } from "@/api/requests/updateTournament";
import { createTournament } from "@/api/requests/createTournament";
import { getTasks } from "@/api/requests/getTasks";
import { createTask } from "@/api/requests/createTask";
import { updateTask } from "@/api/requests/updateTask";
import { deleteTask } from "@/api/requests/deleteTask";
import { EditTournamentModal } from "./EditTournamentModal";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { auth } from "@/firebase";
import { Hero } from "@/components/Hero";
import { Stars } from "@/components/Stars";
import {
  TournamentsTab,
  TasksTab,
  TournamentInfoModal,
  TaskManagementModal,
  type Tournament,
  type Task,
} from "./components";
import type { TaskFormData } from "./components/TaskManagementModal";

const toLocalNaiveISO = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toISOString().split('.')[0].replace('Z', '');
};

const OrganizerPanel = () => {
  const currentUser = useSelector((s: RootState) => s.user.user);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"tournaments" | "tasks">("tournaments");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["tournaments", currentUser?.id],
    queryFn: async () => {
      const data = await getAllTournaments();
      return data.filter((t: Tournament) => t.creator?.id === currentUser?.id);
    },
    enabled: !!currentUser?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTournament(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateTournament(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setIsEditModalOpen(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setIsCreateModalOpen(false);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: { tournamentId: number; taskData: TaskFormData; user: any }) =>
      createTask(data.tournamentId, {
        ...data.taskData,
        start_time: toLocalNaiveISO(data.taskData.start_time),
        end_time: toLocalNaiveISO(data.taskData.end_time),
      }, data.user),
    onSuccess: (newTask) => {
      setTasks((prev) => [...prev, newTask]);
      setIsTaskModalOpen(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: { tournamentId: number; taskId: number; taskData: TaskFormData; user: any }) =>
      updateTask(data.tournamentId, data.taskId, {
        ...data.taskData,
        start_time: toLocalNaiveISO(data.taskData.start_time),
        end_time: toLocalNaiveISO(data.taskData.end_time),
      }, data.user),
    onSuccess: (updatedTask) => {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      setIsTaskModalOpen(false);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (data: { tournamentId: number; taskId: number; user: any }) =>
      deleteTask(data.tournamentId, data.taskId, data.user),
    onSuccess: (_, variables) => {
      setTasks((prev) => prev.filter((task) => task.id !== variables.taskId));
    },
  });

  const handleSaveTask = async (formData: TaskFormData, firebaseUser: any) => {
    if (!selectedTournament) return;
    if (editingTask) {
      await updateTaskMutation.mutateAsync({
        tournamentId: selectedTournament.id,
        taskId: editingTask.id,
        taskData: formData,
        user: firebaseUser
      });
    } else {
      await createTaskMutation.mutateAsync({
        tournamentId: selectedTournament.id,
        taskData: formData,
        user: firebaseUser
      });
    }
  };

  if (!currentUser) return <div className="p-20 text-center font-black">Завантаження профілю...</div>;

  return (
    <div className="relative min-h-screen pb-32">
      <div className="relative z-20">
        <div className="relative top-5"><Stars/></div>
        <Hero 
          bgText="ОРГАНІЗАТОР"
          title="Панель Організатора"
          description="Керуйте турнірами, завданнями та командами. Відслідковуйте результати та координуйте подію."
        />

        <div className="max-w-7xl mx-auto px-8 -mt-24 relative z-30">
          <div className="flex gap-4 justify-center mb-10">
            <button 
              onClick={() => setActiveTab("tournaments")} 
              className={`px-8 py-4 rounded-2xl font-black uppercase transition-all shadow-lg hover:scale-105 active:scale-95 ${activeTab === "tournaments" ? "bg-[#fbbf24] text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
            >
              🏆 Турніри
            </button>
            <button 
              onClick={() => setActiveTab("tasks")} 
              className={`px-8 py-4 rounded-2xl font-black uppercase transition-all shadow-lg hover:scale-105 active:scale-95 ${activeTab === "tasks" ? "bg-[#fbbf24] text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
            >
              📋 Завдання
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
            {isLoading ? (
              <div className="py-20 text-center animate-pulse font-bold text-slate-300">ЗАВАНТАЖЕННЯ...</div>
            ) : (
              <>
                {activeTab === "tournaments" && (
                  <TournamentsTab
                    tournaments={tournaments}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    onInfo={(t) => { setSelectedTournament(t); setIsInfoModalOpen(true); }}
                    onEdit={(t) => { setSelectedTournament(t); setIsEditModalOpen(true); }}
                    onDelete={(id) => confirm("Видалити?") && deleteMutation.mutateAsync(id)}
                    onCreateClick={() => setIsCreateModalOpen(true)}
                  />
                )}

                {activeTab === "tasks" && (
                  <TasksTab
                    tournaments={tournaments}
                    tasks={tasks}
                    selectedTournament={selectedTournament}
                    onTasksClick={(t) => {
                      setSelectedTournament(t);
                      if (t) getTasks(t.id).then(setTasks).catch(() => setTasks([]));
                    }}
                    onCreateTaskClick={(t) => { setSelectedTournament(t); setEditingTask(null); setIsTaskModalOpen(true); }}
                    onEditTaskClick={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }}
                    onDeleteTaskClick={(id) => selectedTournament && deleteTaskMutation.mutateAsync({ tournamentId: selectedTournament.id, taskId: id, user: auth.currentUser })}
                    onSwitchTab={() => setActiveTab("tournaments")}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <TaskManagementModal
        isOpen={isTaskModalOpen}
        tournament={selectedTournament}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
        editingTask={editingTask}
      />
      <EditTournamentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} tournament={selectedTournament} onSave={async (id, data) => updateMutation.mutateAsync({ id, data })} />
      <CreateTournamentModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={async (data) => createMutation.mutateAsync(data)} />
      <TournamentInfoModal isOpen={isInfoModalOpen} tournament={selectedTournament} onClose={() => setIsInfoModalOpen(false)} />
    </div>
  );
};

export { OrganizerPanel };