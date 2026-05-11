import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import appConfig from "@/../../shared/app_config.json";
import { type Tournament } from "./types";

const REQUIREMENT_OPTIONS = appConfig.requirement_options;

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

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-2 cursor-help">
    <div className="w-4 h-4 bg-[#6D72F1]/10 text-[#6D72F1] rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-[#6D72F1] hover:text-white transition-all">?</div>
    <div className="absolute top-6 left-0 hidden group-hover:block w-52 p-3 bg-white text-slate-600 text-[11px] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-100 z-[100] leading-normal animate-in fade-in zoom-in duration-200">
      <div className="relative z-[101] font-semibold">{text}</div>
      <div className="absolute -top-1 left-1.5 border-4 border-transparent border-b-white"></div>
    </div>
  </div>
);

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
      const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
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
        start_time: editingTask.start_time ? formatDateTime(editingTask.start_time) : "",
        end_time: editingTask.end_time ? formatDateTime(editingTask.end_time) : "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr[name];
      return newErr;
    });
  };

  const handleAddRequirement = (name: string) => {
    if (!name || formData.requirements.includes(name)) return;
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, name],
    }));
    if (errors.requirements) setErrors(p => ({ ...p, requirements: "" }));
  };

  const handleRemoveRequirement = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((r) => r !== name),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) newErrors.title = "Назва занадто коротка";
    if (!formData.start_time) newErrors.start_time = "Обов'язково";
    if (!formData.end_time) newErrors.end_time = "Обов'язково";
    if (formData.requirements.length === 0) newErrors.requirements = "Оберіть хоча б одну технологію";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        <div className="bg-[#6D72F1] p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight italic">
              {editingTask ? "Оновити завдання" : "Створити завдання"}
            </h2>
            {tournament && (
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">
                Для турніру: {tournament.title}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#FBFBFF] space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
              Заголовок <Tooltip text="Назва завдання, яку бачитимуть учасники в списку" />
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Наприклад: створити веб платформу"
              className={`w-full px-5 py-4 bg-white border ${errors.title ? 'border-red-400' : 'border-slate-200'} rounded-2xl outline-none focus:border-[#6D72F1] font-bold text-slate-800 shadow-sm`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Деталі завдання</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Що саме потрібно зробити?"
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#6D72F1] text-slate-700 font-medium shadow-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Початок виконання</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className={`w-full p-4 bg-white border ${errors.start_time ? 'border-red-400' : 'border-slate-200'} rounded-2xl text-xs font-bold text-slate-800 outline-none`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Дедлайн</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                className={`w-full p-4 bg-white border ${errors.end_time ? 'border-red-400' : 'border-slate-200'} rounded-2xl text-xs font-bold text-slate-800 outline-none`}
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
              Необхідні вимоги <Tooltip text="Оберіть інструменти, які обов'язкові для цього завдання" />
            </label>
            
            <select
              onChange={(e) => {
                handleAddRequirement(e.target.value);
                e.target.value = "";
              }}
              className={`w-full px-5 py-4 bg-white border ${errors.requirements ? 'border-red-400' : 'border-slate-200'} rounded-2xl outline-none focus:border-[#6D72F1] font-bold text-slate-800 shadow-sm appearance-none cursor-pointer`}
            >
              <option value="">Додати вимогу...</option>
              {Object.entries(groupedRequirements).map(([category, items]) => (
                <optgroup key={category} label={category} className="font-bold text-[#6D72F1]">
                  {items.map((item) => (
                    <option 
                      key={item.name} 
                      value={item.name} 
                      disabled={formData.requirements.includes(item.name)}
                      className="text-slate-800 font-medium"
                    >
                      {item.display_name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="flex flex-wrap gap-2">
              {formData.requirements.map((reqName) => {
                const configItem = REQUIREMENT_OPTIONS.find(opt => opt.name === reqName);
                return (
                  <span
                    key={reqName}
                    className="bg-[#6D72F1]/10 text-[#6D72F1] border border-[#6D72F1]/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-3 animate-in fade-in zoom-in duration-200"
                  >
                    {configItem?.display_name || reqName}
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(reqName)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">
            Скасувати
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-[2] py-4 bg-[#6D72F1] text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-[#6D72F1]/20 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-[0.98] hover:brightness-110"
          >
            {isLoading ? "Збереження..." : editingTask ? "Оновити завдання" : "Створити завдання"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export { TaskManagementModal };