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
import {
  TournamentsTab,
  TasksTab,
  TournamentInfoModal,
  TaskManagementModal,
  type Tournament,
  type Task,
} from "./components";
import type { TaskFormData } from "./components/TaskManagementModal";

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
    mutationFn: deleteTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
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
    mutationFn: (data: { tournamentId: number; taskData: TaskFormData }) =>
      createTask(data.tournamentId, {
        title: data.taskData.title,
        description: data.taskData.description,
        start_time: new Date(data.taskData.start_time).toISOString(),
        end_time: new Date(data.taskData.end_time).toISOString(),
        requirements: data.taskData.requirements,
      }),
    onSuccess: (newTask) => {
      setTasks((prev) => [...prev, newTask]);
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: { tournamentId: number; taskId: number; taskData: TaskFormData }) =>
      updateTask(data.tournamentId, data.taskId, {
        title: data.taskData.title,
        description: data.taskData.description,
        start_time: new Date(data.taskData.start_time).toISOString(),
        end_time: new Date(data.taskData.end_time).toISOString(),
        requirements: data.taskData.requirements,
      }),
    onSuccess: (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (data: { tournamentId: number; taskId: number }) =>
      deleteTask(data.tournamentId, data.taskId),
    onSuccess: (_, variables) => {
      setTasks((prev) =>
        prev.filter((task) => task.id !== variables.taskId)
      );
    },
  });

  const handleDeleteTournament = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error(error);
    }
  };

  const openInfo = (t: Tournament) => {
    setSelectedTournament(t);
    setIsInfoModalOpen(true);
  };

  const openEdit = (t: Tournament) => {
    setSelectedTournament(t);
    setIsEditModalOpen(true);
  };

  const openTasksTab = (t: Tournament | null) => {
    setSelectedTournament(t);
    if (t) {
      getTasks(t.id)
        .then((fetchedTasks: Task[]) => setTasks(fetchedTasks))
        .catch(() => setTasks([]));
    }
  };

  const openCreateTask = (t: Tournament) => {
    setSelectedTournament(t);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (formData: TaskFormData) => {
    if (!selectedTournament) return;
    try {
      await createTaskMutation.mutateAsync({
        tournamentId: selectedTournament.id,
        taskData: formData,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!selectedTournament || !editingTask) return;
    try {
      await updateTaskMutation.mutateAsync({
        tournamentId: selectedTournament.id,
        taskId: editingTask.id,
        taskData: formData,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!selectedTournament || !confirm("Видалити завдання?")) return;
    try {
      await deleteTaskMutation.mutateAsync({
        tournamentId: selectedTournament.id,
        taskId: taskId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = editingTask ? handleUpdateTask : handleCreateTask;

  if (!currentUser)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center animate-pulse">
           <div className="w-16 h-16 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Профіль...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <section className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] relative pt-20 pb-40 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="bg-[#fbbf24] text-slate-900 px-6 py-2.5 rounded-2xl font-black text-xs inline-block mb-8 shadow-xl uppercase tracking-tighter">
            ⚡ Привіт Організаторе!
          </span>
          <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight mb-6 drop-shadow-2xl uppercase italic leading-none">
            Управління <br className="hidden md:block" /> Подіями
          </h1>
        </div>
        
        <div className="absolute -bottom-1 left-0 w-full leading-[0]">
          <svg viewBox="0 0 1440 120" className="h-[60px] md:h-[100px] w-full fill-[#F8FAFC]" preserveAspectRatio="none">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 -mt-24 relative z-20">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-12">
          <button
            onClick={() => setActiveTab("tournaments")}
            className={`w-full md:w-auto px-12 py-5 rounded-[2rem] font-black text-sm transition-all shadow-2xl flex items-center justify-center gap-3 tracking-widest uppercase ${
              activeTab === "tournaments"
                ? "bg-[#fbbf24] text-slate-900 scale-105 ring-4 ring-[#fbbf24]/20"
                : "bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="text-xl">🏆</span> Турніри
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`w-full md:w-auto px-12 py-5 rounded-[2rem] font-black text-sm transition-all shadow-2xl flex items-center justify-center gap-3 tracking-widest uppercase ${
              activeTab === "tasks"
                ? "bg-[#fbbf24] text-slate-900 scale-105 ring-4 ring-[#fbbf24]/20"
                : "bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="text-xl">📋</span> Завдання
          </button>
        </div>

        <div className="bg-white rounded-[3rem] p-8 md:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-32 gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-8 border-slate-100 rounded-full"></div>
                <div className="w-20 h-20 border-8 border-[#6366f1] border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Оновлення даних...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === "tournaments" && (
                <TournamentsTab
                  tournaments={tournaments}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  onInfo={openInfo}
                  onEdit={openEdit}
                  onDelete={handleDeleteTournament}
                  onCreateClick={() => setIsCreateModalOpen(true)}
                />
              )}

              {activeTab === "tasks" && (
                <TasksTab
                  tournaments={tournaments}
                  tasks={tasks}
                  selectedTournament={selectedTournament}
                  onTasksClick={openTasksTab}
                  onCreateTaskClick={openCreateTask}
                  onEditTaskClick={openEditTask}
                  onDeleteTaskClick={handleDeleteTask}
                  onSwitchTab={() => setActiveTab("tournaments")}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <TournamentInfoModal
        isOpen={isInfoModalOpen}
        tournament={selectedTournament}
        onClose={() => setIsInfoModalOpen(false)}
      />

      <TaskManagementModal
        isOpen={isTaskModalOpen}
        tournament={selectedTournament}
        onClose={handleTaskModalClose}
        onSave={handleSaveTask}
        isLoading={editingTask ? updateTaskMutation.isPending : createTaskMutation.isPending}
        editingTask={editingTask}
      />

      <EditTournamentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tournament={selectedTournament}
        onSave={async (id, data) => {
          await updateMutation.mutateAsync({ id, data });
        }}
      />
      
      <CreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={async (data: any) => {
          await createMutation.mutateAsync(data);
        }}
      />
    </div>
  );
};

export { OrganizerPanel };