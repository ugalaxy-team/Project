import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import appConfig from "@/../../shared/app_config.json";
import { type Tournament } from "./types";
import DateTimePicker from "@/components/ui/DateTimePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import { X, Plus, Info, CheckCircle2, Loader2 } from "lucide-react";

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
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    requirements: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const groupedOptions = useMemo(() => {
    const filtered = REQUIREMENT_OPTIONS.filter(
      (opt) => !formData.requirements.includes(opt.name)
    );

    const groups: Record<string, any[]> = {};

    filtered.forEach((opt) => {
      const categoryId = opt.category_id || "Other";
      if (!groups[categoryId]) {
        groups[categoryId] = [];
      }
      groups[categoryId].push({
        id: opt.name,
        label: opt.display_name,
      });
    });

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items,
    }));
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
        });
      } else {
        setFormData({
          title: "",
          description: "",
          start_time: "",
          end_time: "",
          requirements: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, editingTask]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Обов'язкове поле";
    else if (formData.title.trim().length < 3)
      newErrors.title = "Мінімум 3 символи";
    if (!formData.start_time) newErrors.start_time = "Вкажіть час";
    if (!formData.end_time) newErrors.end_time = "Вкажіть час";
    
    if (formData.start_time && formData.end_time) {
      if (new Date(formData.start_time) >= new Date(formData.end_time)) {
        newErrors.end_time = "Має бути пізніше старту";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;
    await onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#6D72F1] p-8 text-white shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight italic leading-none">
                {editingTask ? "Оновити таск" : "Нове завдання"}
              </h2>
              {tournament && (
                <div className="flex items-center gap-2 mt-2 opacity-80">
                   <div className="h-px w-4 bg-white/50"></div>
                   <p className="text-[10px] font-black uppercase tracking-widest">Турнір: {tournament.title}</p>
                </div>
              )}
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                Назва завдання <Tooltip text="Введіть коротку назву" />
              </label>
              {errors.title && <span className="text-[9px] text-red-500 font-bold uppercase">{errors.title}</span>}
            </div>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Наприклад: Розробка смарт-контракту"
              className={`w-full px-5 py-4 bg-white border-2 rounded-2xl outline-none transition-all font-bold text-slate-800 ${
                errors.title ? "border-red-200 focus:border-red-500" : "border-slate-100 focus:border-[#6D72F1]"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Детальний опис</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#6D72F1] text-slate-700 font-bold resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <DateTimePicker 
                label="Старт прийому"
                value={formData.start_time}
                onChange={(date) => setFormData(p => ({...p, start_time: date}))}
              />
              {errors.start_time && <p className="text-[9px] text-red-500 font-bold uppercase ml-1">{errors.start_time}</p>}
            </div>
            <div className="space-y-2">
              <DateTimePicker 
                label="Кінцевий дедлайн"
                value={formData.end_time}
                onChange={(date) => setFormData(p => ({...p, end_time: date}))}
              />
              {errors.end_time && <p className="text-[9px] text-red-500 font-bold uppercase ml-1">{errors.end_time}</p>}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">Стек технологій</label>
            <CustomSelect
              label={groupedOptions.length > 0 ? "Додати інструмент" : "Весь стек додано"}
              options={groupedOptions}
              disabled={groupedOptions.length === 0}
              value={null}
              onChange={(opt) => setFormData(p => ({...p, requirements: [...p.requirements, opt.id as string]}))}
              icon={Plus}
            />
            
            {formData.requirements.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-4 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
                {formData.requirements.map((reqName) => (
                  <div key={reqName} className="bg-white text-[#6D72F1] border border-slate-100 pl-3 pr-1 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-sm hover:border-[#6D72F1] transition-colors">
                    <CheckCircle2 size={12} className="text-green-500" />
                    {reqName}
                    <button type="button" onClick={() => setFormData(p => ({...p, requirements: p.requirements.filter(r => r !== reqName)}))} className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Вимоги не вказані</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-4 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 py-4 bg-[#6D72F1] disabled:bg-slate-300 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-[#6D72F1]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Зберегти"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export { TaskManagementModal };