import { useState, useEffect, useMemo, type FC } from "react";
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
import {
  TournamentsTab,
  TasksTab,
  TournamentInfoModal,
  TaskManagementModal,
  type Tournament,
  type Task,
} from "./components";
import type { TaskFormData } from "./components/TaskManagementModal";

const InteractiveGarland: FC = () => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1000);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const handleResize = () => setScreenWidth(window.innerWidth);
    const handleMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    let animationFrame: number;
    const animate = () => {
      setTime((t) => t + 1);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMove);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  const stars = useMemo(() => {
    const glowingIndices = new Set([3, 7, 12, 15, 19, 23, 28, 31, 35, 39]);
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      leftPercent: i * 2.5 + 1.25,
      stringHeight: 25 + Math.sin(i * 1.5) * 15 + Math.random() * 35,
      size: 10 + (i % 3) * 4 + Math.random() * 4,
      sensitivity: 0.6 + Math.random() * 0.4,
      canGlow: glowingIndices.has(i),
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-80 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => {
        const starX = (star.leftPercent / 100) * screenWidth;
        const starY = star.stringHeight;
        const dx = mousePos.x - starX;
        const dy = mousePos.y - starY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = 160;
        let mouseTilt = 0;

        if (distance < radius) {
          const force = Math.pow((radius - distance) / radius, 1.5);
          mouseTilt = -(dx / radius) * force * 50 * star.sensitivity;
        }
        const weightFactor = star.stringHeight / 80;
        const idleSwing = Math.sin(time * (0.04 + weightFactor * 0.03) + star.phase) * (10 + weightFactor * 8);
        const finalTilt = idleSwing + mouseTilt;
        const isHovered = distance < 60;

        return (
          <div
            key={star.id}
            className="absolute top-9 flex flex-col items-center"
            style={{
              left: `${star.leftPercent}%`,
              transform: `rotate(${finalTilt}deg)`,
              transformOrigin: "top center",
              transition: "transform 0.15s linear",
            }}
          >
            <div
              className="w-[1px] bg-gradient-to-b from-white/30 via-white/10 to-transparent"
              style={{ height: `${star.stringHeight}px` }}
            />
            <svg
              width={star.size}
              height={star.size}
              viewBox="0 0 24 24"
              className={`transition-all duration-500 ${
                star.canGlow && isHovered
                  ? "drop-shadow-[0_0_16px_rgba(255,255,255,0.9)] fill-white scale-125"
                  : "drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] fill-white/60 scale-100 opacity-80"
              }`}
            >
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

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
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <section className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] pt-24 pb-44 px-8 text-center relative overflow-hidden">
        <InteractiveGarland />
        <h1 className="text-white text-5xl md:text-7xl font-black uppercase italic relative z-10 drop-shadow-2xl tracking-tighter mt-12">
          Панель Організатора
        </h1>
      </section>

      <div className="max-w-7xl mx-auto px-8 -mt-24 relative z-20">
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