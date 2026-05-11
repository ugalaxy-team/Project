import React, { useState, useMemo } from "react";
import { type Tournament } from "./types";

const REQUIREMENT_OPTIONS = [
  { name: "Python", display_name: "Python", category_id: "Languages" },
  { name: "JavaScript", display_name: "JavaScript", category_id: "Languages" },
  { name: "TypeScript", display_name: "TypeScript", category_id: "Languages" },
  { name: "Java", display_name: "Java", category_id: "Languages" },
  { name: "C#", display_name: "C#", category_id: "Languages" },
  { name: "Go", display_name: "Go", category_id: "Languages" },
  { name: "Rust", display_name: "Rust", category_id: "Languages" },
  { name: "FastAPI", display_name: "FastAPI", category_id: "Frameworks" },
  { name: "Django", display_name: "Django", category_id: "Frameworks" },
  { name: "Flask", display_name: "Flask", category_id: "Frameworks" },
  { name: "Express", display_name: "Express", category_id: "Frameworks" },
  { name: "Spring Boot", display_name: "Spring Boot", category_id: "Frameworks" },
  { name: "React", display_name: "React", category_id: "JS Frameworks" },
  { name: "Vue", display_name: "Vue", category_id: "JS Frameworks" },
  { name: "Angular", display_name: "Angular", category_id: "JS Frameworks" },
  { name: "Next.js", display_name: "Next.js", category_id: "JS Frameworks" },
  { name: "Redux", display_name: "Redux", category_id: "State Management" },
  { name: "Zustand", display_name: "Zustand", category_id: "State Management" },
  { name: "Recoil", display_name: "Recoil", category_id: "State Management" },
  { name: "PostgreSQL", display_name: "PostgreSQL", category_id: "SQL" },
  { name: "MySQL", display_name: "MySQL", category_id: "SQL" },
  { name: "SQLite", display_name: "SQLite", category_id: "SQL" },
  { name: "MongoDB", display_name: "MongoDB", category_id: "NoSQL" },
  { name: "Redis", display_name: "Redis", category_id: "NoSQL" },
  { name: "Firebase", display_name: "Firebase", category_id: "NoSQL" },
  { name: "Pinecone", display_name: "Pinecone", category_id: "Vector DB" },
  { name: "Weaviate", display_name: "Weaviate", category_id: "Vector DB" },
  { name: "Docker", display_name: "Docker", category_id: "DevOps" },
  { name: "Kubernetes", display_name: "Kubernetes", category_id: "DevOps" },
  { name: "GitHub Actions", display_name: "GitHub Actions", category_id: "DevOps" },
  { name: "AWS", display_name: "AWS", category_id: "Cloud" },
  { name: "Google Cloud", display_name: "Google Cloud", category_id: "Cloud" },
  { name: "Azure", display_name: "Azure", category_id: "Cloud" },
  { name: "Prometheus", display_name: "Prometheus", category_id: "Monitoring" },
  { name: "Grafana", display_name: "Grafana", category_id: "Monitoring" },
  { name: "ELK Stack", display_name: "ELK Stack", category_id: "Monitoring" },
];

export interface TaskFormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  requirements: string[];
}

interface TaskManagementModalProps {
  isOpen: boolean;
  tournament: Tournament | null;
  onClose: () => void;
  onSave: (formData: TaskFormData) => Promise<void>;
  isLoading?: boolean;
  editingTask?: any | null;
}

const TaskManagementModal = ({
  isOpen,
  tournament,
  onClose,
  onSave,
  isLoading = false,
  editingTask = null,
}: TaskManagementModalProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    requirements: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen && editingTask) {
      const start = new Date(editingTask.start_time);
      const end = new Date(editingTask.end_time);
      const formatDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      setFormData({
        title: editingTask.title || "",
        description: editingTask.description || "",
        start_time: formatDateTime(start),
        end_time: formatDateTime(end),
        requirements: editingTask.requirements || [],
      });
    } else if (isOpen) {
      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        requirements: [],
      });
    }
  }, [isOpen, editingTask]);

  const groupedRequirements = useMemo(() => {
    return REQUIREMENT_OPTIONS.reduce((acc, item) => {
      if (!acc[item.category_id]) {
        acc[item.category_id] = [];
      }
      acc[item.category_id].push(item);
      return acc;
    }, {} as Record<string, typeof REQUIREMENT_OPTIONS>);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddRequirement = (name: string) => {
    if (!name) return;
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.includes(name)
        ? prev.requirements
        : [...prev.requirements, name],
    }));
    if (errors.requirements) {
      setErrors((prev) => ({ ...prev, requirements: "" }));
    }
  };

  const handleRemoveRequirement = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((r) => r !== name),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = "Назва повинна бути не менше 3 символів";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Вкажіть час початку";
    }
    if (!formData.end_time) {
      newErrors.end_time = "Вкажіть час закінчення";
    }
    if (formData.requirements.length === 0) {
      newErrors.requirements = "Додайте хоча б одну вимогу";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSave(formData);
    
    setFormData({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      requirements: [],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 uppercase">
            {editingTask ? "Редагування завдання" : "Нове завдання"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {tournament && (
          <p className="text-slate-600 mb-6 font-semibold">
            Турнір: <span className="text-[#6366f1]">{tournament.title}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Назва завдання
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg font-medium text-slate-800 focus:outline-none transition-colors ${
                errors.title
                  ? "border-red-500"
                  : "border-slate-200 focus:ring-2 focus:ring-[#6366f1]/20"
              }`}
              placeholder="Введіть назву..."
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Опис
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 transition-colors resize-none"
              rows={3}
              placeholder="Опишіть завдання..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Час початку
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg font-medium text-slate-800 focus:outline-none ${
                  errors.start_time ? "border-red-500" : "border-slate-200"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Час закінчення
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg font-medium text-slate-800 focus:outline-none ${
                  errors.end_time ? "border-red-500" : "border-slate-200"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Необхідні технології
            </label>
            <div className="mb-3">
              <select
                value=""
                onChange={(e) => {
                  handleAddRequirement(e.target.value);
                  e.target.value = "";
                }}
                className={`w-full px-4 py-2 border rounded-lg font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 transition-colors ${
                  errors.requirements ? "border-red-500" : "border-slate-200"
                }`}
              >
                <option value="" disabled>Виберіть технологію...</option>
                {Object.entries(groupedRequirements).map(([category, items]) => (
                  <optgroup key={category} label={category}>
                    {items.map((item) => (
                      <option
                        key={item.name}
                        value={item.name}
                        disabled={formData.requirements.includes(item.name)}
                      >
                        {item.display_name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {formData.requirements.map((reqName) => {
                const configItem = REQUIREMENT_OPTIONS.find(opt => opt.name === reqName);
                return (
                  <span
                    key={reqName}
                    className="bg-[#6366f1] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 animate-in fade-in zoom-in duration-200"
                  >
                    {configItem?.display_name || reqName}
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(reqName)}
                      className="hover:text-red-200 transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
            {errors.requirements && (
              <p className="text-red-500 text-xs mt-1">{errors.requirements}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all shadow-md active:transform active:scale-[0.98]"
            >
              {isLoading ? "Збереження..." : editingTask ? "Зберегти завдання" : "Створити завдання"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { TaskManagementModal };