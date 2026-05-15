import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import appConfig from "@/../../shared/app_config.json";
import DateTimePicker from "@/components/ui/DateTimePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import { X, Plus, Loader2, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { auth } from "@/firebase";
import { toPickerDateTimeValue } from "@/utils/naiveDateTime";

const REQUIREMENT_OPTIONS = appConfig.requirement_options;

const TaskManagementModal = ({
  isOpen,
  tournament,
  onClose,
  onSave,
  isLoading = false,
  editingTask = null,
}: any) => {
  const { t } = useTranslation("modals");
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

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setFormData({
          title: editingTask.title || "",
          description: editingTask.description || "",
          start_time: toPickerDateTimeValue(editingTask.start_time),
          end_time: toPickerDateTimeValue(editingTask.end_time),
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
    if (!formData.title.trim()) { setErrors({ title: t("task_management.validation.required") }); return; }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const payload = {
        ...formData,
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm dark:bg-black/70" onClick={onClose}>
      <div className="bg-bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary p-8 text-white shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase italic leading-none">{editingTask ? t("task_management.edit_title") : t("task_management.create_title")}</h2>
            <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-bg-card/10 hover:bg-bg-card/20 rounded-xl transition-colors">
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-bg-card space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">{t("fields.title")}</label>
            <input name="title" value={formData.title} onChange={handleChange} className={`w-full px-5 py-4 border-2 rounded-2xl outline-none font-bold ${errors.title ? "border-red-200" : "border-border focus:border-primary"}`} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">{t("fields.description")}</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-5 py-4 border-2 border-border rounded-2xl outline-none focus:border-primary font-bold resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePicker label={t("fields.start")} value={formData.start_time} onChange={(d) => setFormData(p => ({ ...p, start_time: d }))} />
            <DateTimePicker label={t("fields.deadline")} value={formData.end_time} onChange={(d) => setFormData(p => ({ ...p, end_time: d }))} />
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">{t("task_management.tech_stack")}</label>
            <CustomSelect label={t("task_management.add_requirement")} options={groupedOptions} value={null} onChange={(opt) => setFormData(p => ({ ...p, requirements: [...p.requirements, opt.id as string] }))} icon={Plus} />
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map(req => (
                <div key={req} className="bg-bg-card border border-border pl-3 pr-1 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                  {req}
                  <button type="button" onClick={() => setFormData(p => ({ ...p, requirements: p.requirements.filter(r => r !== req) }))} className="text-text-muted/50 hover:text-red-500"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-border">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">{t("task_management.criteria")}</label>
            <div className="flex gap-2">
              <input value={newCriterion} onChange={(e) => setNewCriterion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCriterion(); } }} className="flex-1 px-5 py-3 border-2 border-border rounded-2xl outline-none focus:border-primary text-sm font-bold" placeholder={t("task_management.criterion_placeholder")} />
              <button type="button" onClick={handleAddCriterion} className="p-3 bg-primary text-white rounded-xl active:scale-95 transition-transform"><Plus size={20} /></button>
            </div>
            <div className="space-y-2">
              {formData.criteria.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-bg-body rounded-xl border border-border">
                  <span className="text-[11px] font-bold text-text-muted uppercase flex items-center gap-2"><Target size={14} /> {c}</span>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, criteria: p.criteria.filter((_, i) => i !== idx) }))} className="text-text-muted/50 hover:text-red-500"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-bg-body border-t flex gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-4 font-black text-text-muted uppercase text-[10px]">{t("common.cancel")}</button>
          <button type="button" onClick={handleSubmit} disabled={isLoading} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : t("task_management.save")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export { TaskManagementModal };