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
      console.error("Помилка при видаленні:", error);
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
      // Fetch tasks for the selected tournament
      getTasks(t.id)
        .then((fetchedTasks: Task[]) => {
          setTasks(fetchedTasks);
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
          setTasks([]);
        });
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
      console.error("Помилка при створенні завдання:", error);
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
      console.error("Помилка при редагуванні завдання:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!selectedTournament || !confirm("Ви впевнені, що хочете видалити це завдання?")) return;
    try {
      await deleteTaskMutation.mutateAsync({
        tournamentId: selectedTournament.id,
        taskId: taskId,
      });
    } catch (error) {
      console.error("Помилка при видаленні завдання:", error);
    }
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = editingTask ? handleUpdateTask : handleCreateTask;

  if (!currentUser)
    return (
      <div className="p-10 text-center font-bold text-slate-500">
        Завантаження профілю...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <section className="bg-[#6366f1] relative pt-12 pb-28 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <span className="bg-[#fbbf24] text-slate-900 px-4 py-1.5 rounded-full font-bold text-xs inline-block mb-6 shadow-sm">
            👋 Привіт, {"Організаторе"}!
          </span>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black tracking-wider mb-4 drop-shadow-md uppercase italic leading-tight">
            ПАНЕЛЬ ОРГАНІЗАТОРА
          </h1>
        </div>
        <div className="absolute -bottom-[1px] left-0 w-full leading-[0]">
          <svg
            viewBox="0 0 1440 100"
            className="h-[40px] md:h-[70px] w-full"
            preserveAspectRatio="none"
          >
            <path
              fill="#F8FAFC"
              d="M0,50 C320,0 420,0 720,50 C1020,100 1120,100 1440,50 L1440,100 L0,100 Z"
            ></path>
          </svg>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("tournaments")}
            className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
              activeTab === "tournaments"
                ? "bg-[#fbbf24] text-slate-900 scale-105"
                : "bg-white text-slate-500 hover:bg-gray-50"
            }`}
          >
            🏆 МОЇ ТУРНІРИ
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
              activeTab === "tasks"
                ? "bg-[#fbbf24] text-slate-900 scale-105"
                : "bg-white text-slate-500 hover:bg-gray-50"
            }`}
          >
            📋 КЕРУВАННЯ ЗАВДАННЯМИ
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-gray-100">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#6366f1]"></div>
              <p className="text-slate-400 font-bold animate-pulse">
                Завантаження...
              </p>
            </div>
          ) : (
            <>
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
            </>
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