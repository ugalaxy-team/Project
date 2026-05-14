import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import appConfig from "@/../../shared/app_config.json";
import { type Tournament } from "./types";
import DateTimePicker from "@/components/ui/DateTimePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import { X, Plus, Info, CheckCircle2, Loader2, Target } from "lucide-react";
import { auth } from "@/firebase";

const REQUIREMENT_OPTIONS = appConfig.requirement_options;

export interface TaskFormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  requirements: string[];
  criteria: any[]; // Змінено на any[], бо бекенд чекає об'єкти
}

interface TaskManagementModalProps {
  isOpen: boolean;
  tournament: Tournament | null;
  onClose: () => void;
  onSave: (formData: TaskFormData, firebaseUser: any) => Promise<void>;
  isLoading?: boolean;
  editingTask?: any | null;
}

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-2 cursor-help">
    <div className="w-4 h-4 bg-[#6D72F1]/10 text-[#6D72F1] rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-[#6D72F1] hover:text-white transition-all">
      <Info size={10} strokeWidth={3} />
    </div>
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block w-52 p-3 bg-slate-900 text-white text-[10px] font-bold rounded-xl shadow-2xl z-[100] leading-normal uppercase tracking-wider">
      {text}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    requirements: [] as string[],
    criteria: [] as string[], // Тут тримаємо як рядки для зручності інтерфейсу
  });

  const [newCriterion, setNewCriterion] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const groupedOptions = useMemo(() => {
    const filtered = REQUIREMENT_OPTIONS.filter(
      (opt) => !formData.requirements.includes(opt.name)
    );
    const groups: Record<string, any[]> = {};
    filtered.forEach((opt) => {
      const categoryId = opt.category_id || "Other";
      if (!groups[categoryId]) groups[categoryId] = [];
      groups[categoryId].push({ id: opt.name, label: opt.display_name });
    });
    return Object.entries(groups).map(([category, items]) => ({ category, items }));
  }, [formData.requirements]);

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setFormData({
          title: editingTask.title || "",
          description: editingTask.description || "",
          start_time: editingTask.start_time || "",
          end_time: editingTask.end_time || "",
          requirements: editingTask.requirements || [],
          criteria: Array.isArray(editingTask.criteria) 
            ? editingTask.criteria.map((c: any) => typeof c === 'string' ? c : c.name) 
            : [],
        });
      } else {
        setFormData({ title: "", description: "", start_time: "", end_time: "", requirements: [], criteria: [] });
      }
      setErrors({});
      setNewCriterion("");
    }
  }, [isOpen, editingTask]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCriterion = () => {
    if (newCriterion.trim()) {
      setFormData(p => ({ ...p, criteria: [...p.criteria, newCriterion.trim()] }));
      setNewCriterion("");
    }
  };

  const removeCriterion = (index: number) => {
    setFormData(p => ({ ...p, criteria: p.criteria.filter((_, i) => i !== index) }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Обов'язкове поле";
    if (!formData.start_time) newErrors.start_time = "Вкажіть час";
    if (!formData.end_time) newErrors.end_time = "Вкажіть час";
    if (formData.start_time && formData.end_time && new Date(formData.start_time) >= new Date(formData.end_time)) {
      newErrors.end_time = "Має бути пізніше старту";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // ФІКС: Перетворюємо масив рядків у масив об'єктів для Pydantic
      const formattedCriteria = formData.criteria.map(c => ({
        name: c,
        description: "" 
      }));

      const payload = {
        ...formData,
        criteria: formattedCriteria
      };

      await onSave(payload as any, currentUser);
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#6D72F1] p-8 text-white shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase italic leading-none">
              {editingTask ? "Оновити таск" : "Нове завдання"}
            </h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
              Назва <Tooltip text="Введіть коротку назву завдання" />
            </label>
            <input name="title" value={formData.title} onChange={handleInputChange} className={`w-full px-5 py-4 border-2 rounded-2xl outline-none font-bold ${errors.title ? "border-red-200" : "border-slate-100 focus:border-[#6D72F1]"}`} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Опис</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#6D72F1] font-bold resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePicker label="Старт" value={formData.start_time} onChange={(d) => setFormData(p => ({ ...p, start_time: d }))} />
            <DateTimePicker label="Дедлайн" value={formData.end_time} onChange={(d) => setFormData(p => ({ ...p, end_time: d }))} />
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Стек технологій</label>
            <CustomSelect label="Додати вимогу" options={groupedOptions} value={null} onChange={(opt) => setFormData(p => ({ ...p, requirements: [...p.requirements, opt.id as string] }))} icon={Plus} />
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map(req => (
                <div key={req} className="bg-white border border-slate-100 pl-3 pr-1 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                  {req}
                  <button onClick={() => setFormData(p => ({ ...p, requirements: p.requirements.filter(r => r !== req) }))} className="text-slate-300 hover:text-red-500"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-50">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Критерії оцінювання</label>
            <div className="flex gap-2">
              <input value={newCriterion} onChange={(e) => setNewCriterion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCriterion())} placeholder="Додати критерій..." className="flex-1 px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#6D72F1] text-sm font-bold" />
              <button type="button" onClick={addCriterion} className="p-3 bg-[#6D72F1] text-white rounded-xl"><Plus size={20} /></button>
            </div>
            <div className="space-y-2">
              {formData.criteria.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-2"><Target size={14} /> {c}</span>
                  <button onClick={() => removeCriterion(idx)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-4 font-black text-slate-400 uppercase text-[10px]">Скасувати</button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-4 bg-[#6D72F1] text-white rounded-2xl font-black uppercase text-[10px] shadow-lg flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Зберегти"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export { TaskManagementModal };