import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getAllUsers } from "@/api/requests/getAllUsers";
import { JurySelectionModal } from "./components/JurySelectionModal";
import { type User } from "./components/types";

interface FormData {
  title: string;
  description: string;
  start_date: string;
  reg_start: string;
  reg_end: string;
  min_people_in_team: number;
  max_people_in_team: number;
  max_teams: number;
  juries: number[];
  tasks: any[];
}

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-2 cursor-help">
    <div className="w-4 h-4 bg-[#6D72F1]/10 text-[#6D72F1] rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-[#6D72F1] hover:text-white transition-all">?</div>
    <div className="absolute top-6 left-0 hidden group-hover:block w-52 p-3 bg-white text-slate-600 text-[11px] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-100 z-[100] leading-normal animate-in fade-in zoom-in duration-200">
      <div className="relative z-[101] font-semibold">
        {text}
      </div>
      <div className="absolute -top-1 left-1.5 border-4 border-transparent border-b-white"></div>
    </div>
  </div>
);

export const CreateTournamentModal = ({ isOpen, onClose, onCreate }: any) => {
  const initialState: FormData = {
    title: "",
    description: "",
    start_date: "",
    reg_start: "",
    reg_end: "",
    min_people_in_team: 1,
    max_people_in_team: 5,
    max_teams: 10,
    juries: [],
    tasks: [],
  };

  const [formData, setFormData] = useState<FormData>(initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isJuryModalOpen, setIsJuryModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      getAllUsers().then(setAllUsers).catch(console.error);
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = ["max_teams", "min_people_in_team", "max_people_in_team"].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      return (
        formData.title.trim().length >= 3 &&
        formData.description.trim().length >= 10 &&
        formData.reg_start !== "" &&
        formData.reg_end !== "" &&
        formData.start_date !== ""
      );
    }
    return formData.max_teams > 0 && formData.max_people_in_team >= formData.min_people_in_team;
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await onCreate(formData);
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase mb-4 tracking-tight">Готово до запуску</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Турнір створено успішно. Тепер додайте завдання та налаштуйте бали у панелі керування.
          </p>
          <button 
            onClick={() => { setIsSuccess(false); setFormData(initialState); setCurrentStep(1); onClose(); }} 
            className="w-full py-4 bg-[#6D72F1] text-white rounded-2xl font-bold uppercase tracking-widest transition-all hover:brightness-110"
          >
            До керування
          </button>
        </div>
      </div>, document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        <div className="bg-[#6D72F1] p-8 text-white relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Новий турнір
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex gap-2">
            <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 1 ? "bg-white" : "bg-white/20"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 2 ? "bg-white" : "bg-white/20"}`} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#FBFBFF]">
          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#6D72F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Назва <Tooltip text="Вкажіть зрозумілу назву, яку бачитимуть учасники" />
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Наприклад: Winter Coding Cup 2024"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#6D72F1] font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#6D72F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h7" /></svg>
                  Опис <Tooltip text="Коротко про правила та умови перемоги" />
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#6D72F1] text-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-[1.5rem] space-y-4">
                  <span className="text-[10px] font-black text-[#6D72F1] uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Реєстрація
                  </span>
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-bold text-slate-400 uppercase">Відкриття</span>
                      <input name="reg_start" type="datetime-local" value={formData.reg_start} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border-none outline-none" />
                    </div>
                    <div className="relative">
                      <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-bold text-slate-400 uppercase">Закриття</span>
                      <input name="reg_end" type="datetime-local" value={formData.reg_end} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border-none outline-none" />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-[1.5rem] space-y-4 shadow-sm">
                  <span className="text-[10px] font-black text-[#6D72F1] uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Початок
                  </span>
                  <div className="relative pt-2">
                    <span className="absolute top-0 left-3 bg-white px-1 text-[8px] font-bold text-slate-400 uppercase">Дата та час старту</span>
                    <input name="start_date" type="datetime-local" value={formData.start_date} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border-none outline-none" />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium leading-tight">Турнір стане активним автоматично</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { l: "Мін. у команді", n: "min_people_in_team", i: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
                  { l: "Макс. у команді", n: "max_people_in_team", i: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
                  { l: "Ліміт команд", n: "max_teams", i: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                ].map((f) => (
                  <div key={f.n} className="bg-white p-5 rounded-2xl border border-slate-200 text-center relative pt-8 shadow-sm">
                    <svg className="w-4 h-4 text-[#6D72F1] absolute top-3 left-1/2 -translate-x-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.i} /></svg>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">{f.l}</label>
                    <input name={f.n} type="number" min="1" value={formData[f.n as keyof FormData] as number} onChange={handleChange} className="w-full bg-transparent text-2xl font-black text-slate-800 text-center outline-none" />
                  </div>
                ))}
              </div>

              <button type="button" onClick={() => setIsJuryModalOpen(true)} className="w-full p-8 border-2 border-dashed border-slate-200 rounded-[2rem] hover:bg-[#6D72F1]/5 hover:border-[#6D72F1] transition-all group bg-white shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-100 group-hover:bg-[#6D72F1] group-hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-inner">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <span className="font-bold text-slate-800 uppercase text-xs tracking-wide">Додати суддів</span>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Зараз обрано: {formData.juries.length}</p>
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t flex gap-4">
          <button onClick={currentStep === 1 ? onClose : () => setCurrentStep(1)} className="flex-1 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">
            {currentStep === 1 ? "Скасувати" : "Назад"}
          </button>
          <button
            onClick={currentStep === 1 ? () => setCurrentStep(2) : handleCreate}
            disabled={!canGoNext() || isSubmitting}
            className="flex-[2] py-4 bg-[#6D72F1] text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-[#6D72F1]/20 disabled:bg-slate-200 disabled:text-slate-400 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {isSubmitting ? "Створення..." : currentStep === 1 ? "Далі" : "Створити турнір"}
          </button>
        </div>
      </div>

      {isJuryModalOpen && createPortal(
        <JurySelectionModal
          isOpen={isJuryModalOpen}
          onClose={() => setIsJuryModalOpen(false)}
          allUsers={allUsers}
          addedJurors={formData.juries}
          onToggleJuror={(id: number) => {
            const next = formData.juries.includes(id) ? formData.juries.filter(i => i !== id) : [...formData.juries, id];
            setFormData(p => ({ ...p, juries: next }));
          }}
          selectedTournament={{ title: formData.title } as any}
          onSave={() => setIsJuryModalOpen(false)}
        />, document.body
      )}
    </div>, document.body
  );
};