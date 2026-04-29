import React, { useState } from "react";
import type { TournamentData } from "@/api/requests/createTournament";

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: TournamentData) => Promise<void>;
}

interface FormData {
  title: string;
  description: string;
  start_date: string;
  reg_start: string;
  reg_end: string;
  max_teams: number;
}

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate 
}) => {
  const initialState: FormData = {
    title: "",
    description: "",
    start_date: "",
    reg_start: "",
    reg_end: "",
    max_teams: 2,
  };

  const [formData, setFormData] = useState<FormData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "max_teams" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formatDate = (dateStr: string) => {
        if (!dateStr) return null;
        return new Date(dateStr).toISOString();
      };

      const dataToSubmit: TournamentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_date: formatDate(formData.start_date)!,
        reg_start: formatDate(formData.reg_start)!,
        reg_end: formatDate(formData.reg_end)!,
        max_teams: formData.max_teams,
      };

      await onCreate(dataToSubmit);
      setFormData(initialState);
      onClose();
    } catch (error) {
      console.error("Помилка при створенні турніру:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
      
        <div className="bg-gradient-to-r from-[#6b73ff] to-[#4c51bf] p-6 md:p-8 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors text-xl"
            type="button"
          >
            ✕
          </button>
          <h3 className="text-3xl font-black uppercase italic mb-1">НОВИЙ ТУРНІР</h3>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
            СТВОРЕННЯ НОВОЇ ПОДІЇ У ВСЕСВІТІ
          </p>
        </div>

        <div className="overflow-y-auto bg-slate-50/50">
          <form id="create-tournament-form" onSubmit={handleSubmit} className="flex flex-col p-6 md:p-8 gap-6">
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Назва турніру</label>
              <input 
                name="title" 
                type="text" 
                value={formData.title} 
                onChange={handleChange} 
                required
                placeholder="Введіть круту назву..." 
                className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b73ff] shadow-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Опис</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={3}
                placeholder="Про що цей турнір?" 
                className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b73ff] shadow-sm transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 text-center md:text-left">Реєстрація</h4>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Початок</label>
                  <input 
                    name="reg_start" 
                    type="datetime-local" 
                    value={formData.reg_start} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-3 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b73ff]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Кінець</label>
                  <input 
                    name="reg_end" 
                    type="datetime-local" 
                    value={formData.reg_end} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-3 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b73ff]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 text-center md:text-left">Турнір</h4>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Початок</label>
                  <input 
                    name="start_date" 
                    type="datetime-local" 
                    value={formData.start_date} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-3 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b73ff]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Макс. кількість команд</label>
              <input 
                name="max_teams" 
                type="number" 
                min="2" 
                value={formData.max_teams} 
                onChange={handleChange} 
                required
                className="w-full md:w-1/3 px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b73ff] shadow-sm transition-all"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end items-center gap-3 shrink-0 rounded-b-[2rem]">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            СКАСУВАТИ
          </button>
          <button 
            type="submit" 
            form="create-tournament-form" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#6b73ff] to-[#4c51bf] hover:from-[#5a6de0] hover:to-[#3d4096] text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? "СТВОРЕННЯ..." : "СТВОРИТИ ТУРНІР"}
          </button>
        </div>
      </div>
    </div>
  );
};