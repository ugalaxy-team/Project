import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import appConfig from "@/../../shared/app_config.json";
import DateTimePicker from "@/components/ui/DateTimePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import { X, Plus, Loader2, Target } from "lucide-react";
import { auth } from "@/firebase";

const REQUIREMENT_OPTIONS = appConfig.requirement_options;

const TaskManagementModal = ({
  isOpen,
  tournament,
  onClose,
  onSave,
  isLoading = false,
  editingTask = null,
}: any) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    requirements: [] as string[],
    criteria: [] as string[],
  });

  const [newCriterion, setNewCriterion] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatForInput = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.includes('Z') ? dateStr.split('.')[0].slice(0, 16) : dateStr.slice(0, 16);
  };

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setFormData({
          title: editingTask.title || "",
          description: editingTask.description || "",
          start_time: formatForInput(editingTask.start_time),
          end_time: formatForInput(editingTask.end_time),
          requirements: editingTask.requirements || [],
          criteria: Array.isArray(editingTask.criteria) 
            ? editingTask.criteria.map((c: any) => typeof c === 'string' ? c : c.name) 
            : [],
        });
      } else {
        setFormData({ title: "", description: "", start_time: "", end_time: "", requirements: [], criteria: [] });
      }
      setErrors({});
    }
  }, [isOpen, editingTask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim()) {
      setFormData(prev => ({ ...prev, criteria: [...prev.criteria, newCriterion.trim()] }));
      setNewCriterion("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { setErrors({ title: "Обов'язкове поле" }); return; }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const payload = {
        ...formData,
        start_time: formData.start_time.includes(':') ? `${formData.start_time}:00` : formData.start_time,
        end_time: formData.end_time.includes(':') ? `${formData.end_time}:00` : formData.end_time,
        criteria: formData.criteria.map(c => ({ name: c, description: "" }))
      };

      await onSave(payload, currentUser);
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const groupedOptions = useMemo(() => {
    const filtered = REQUIREMENT_OPTIONS.filter(opt => !formData.requirements.includes(opt.name));
    const groups: Record<string, any[]> = {};
    filtered.forEach(opt => {
      const cat = opt.category_id || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ id: opt.name, label: opt.display_name });
    });
    return Object.entries(groups).map(([category, items]) => ({ category, items }));
  }, [formData.requirements]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#6D72F1] p-8 text-white shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase italic leading-none">{editingTask ? "Оновити таск" : "Нове завдання"}</h2>
            <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Назва</label>
            <input name="title" value={formData.title} onChange={handleChange} className={`w-full px-5 py-4 border-2 rounded-2xl outline-none font-bold ${errors.title ? "border-red-200" : "border-slate-100 focus:border-[#6D72F1]"}`} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Опис</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#6D72F1] font-bold resize-none" />
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
                  <button type="button" onClick={() => setFormData(p => ({ ...p, requirements: p.requirements.filter(r => r !== req) }))} className="text-slate-300 hover:text-red-500"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-50">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Критерії оцінювання</label>
            <div className="flex gap-2">
              <input value={newCriterion} onChange={(e) => setNewCriterion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCriterion(); } }} className="flex-1 px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#6D72F1] text-sm font-bold" placeholder="Додати критерій..." />
              <button type="button" onClick={handleAddCriterion} className="p-3 bg-[#6D72F1] text-white rounded-xl active:scale-95 transition-transform"><Plus size={20} /></button>
            </div>
            <div className="space-y-2">
              {formData.criteria.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-2"><Target size={14} /> {c}</span>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, criteria: p.criteria.filter((_, i) => i !== idx) }))} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-4 font-black text-slate-400 uppercase text-[10px]">Скасувати</button>
          <button type="button" onClick={handleSubmit} disabled={isLoading} className="flex-1 py-4 bg-[#6D72F1] text-white rounded-2xl font-black uppercase text-[10px] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Зберегти завдання"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export { TaskManagementModal };