import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getAllUsers } from "@/api/requests/getAllUsers";
import { JurySelectionModal } from "./components/JurySelectionModal";
import { type User } from "./components/types";
import DateTimePicker from "@/components/ui/DateTimePicker";

interface Tournament {
  id: number;
  title?: string;
  description?: string;
  start_date?: string;
  reg_start?: string;
  reg_end?: string;
  max_teams?: number;
  min_people_in_team?: number;
  max_people_in_team?: number;
  juries?: any[];
}

interface UpdateTournamentData {
  title: string;
  description: string;
  start_date: string | null;
  reg_start: string | null;
  reg_end: string | null;
  max_teams: number;
  min_people_in_team: number;
  max_people_in_team: number;
  juries: number[];
}

interface EditTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onSave: (id: number, updateData: UpdateTournamentData) => Promise<void>;
}

interface FormData {
  title: string;
  description: string;
  start_date: string;
  reg_start: string;
  reg_end: string;
  max_teams: number;
  min_people_in_team: number;
  max_people_in_team: number;
  juries: number[];
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

export const EditTournamentModal: React.FC<EditTournamentModalProps> = ({
  isOpen,
  onClose,
  tournament,
  onSave,
}) => {
  const initialState: FormData = {
    title: "",
    description: "",
    start_date: "",
    reg_start: "",
    reg_end: "",
    max_teams: 2,
    min_people_in_team: 1,
    max_people_in_team: 5,
    juries: [],
  };

  const [formData, setFormData] = useState<FormData>(initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJuryModalOpen, setIsJuryModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      getAllUsers().then(setAllUsers).catch(console.error);
      document.body.style.overflow = "hidden";

      if (tournament) {
        const initialJuries = (tournament.juries || []).map((j: any) =>
          typeof j === "object" && j !== null ? j.id : Number(j)
        );

        setFormData({
          title: tournament.title || "",
          description: tournament.description || "",
          start_date: tournament.start_date || "",
          reg_start: tournament.reg_start || "",
          reg_end: tournament.reg_end || "",
          max_teams: tournament.max_teams || 2,
          min_people_in_team: tournament.min_people_in_team || 1,
          max_people_in_team: tournament.max_people_in_team || 5,
          juries: initialJuries,
        });
      }
      setCurrentStep(1);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, tournament]);

  const formatToLocalISO = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numberFields = ["max_teams", "min_people_in_team", "max_people_in_team"];
    setFormData((prev) => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      return formData.title.trim() !== "" && formData.description.trim() !== "";
    }
    return formData.max_teams > 0 && formData.max_people_in_team >= formData.min_people_in_team;
  };

  const handleSave = async () => {
    if (!canGoNext() || !tournament) return;
    setIsSubmitting(true);
    try {
      const dataToSubmit: UpdateTournamentData = {
        title: formData.title,
        description: formData.description,
        start_date: formatToLocalISO(formData.start_date),
        reg_start: formatToLocalISO(formData.reg_start),
        reg_end: formatToLocalISO(formData.reg_end),
        max_teams: formData.max_teams,
        min_people_in_team: formData.min_people_in_team,
        max_people_in_team: formData.max_people_in_team,
        juries: formData.juries.map(Number),
      };
      await onSave(tournament.id, dataToSubmit);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        <div className="bg-[#6D72F1] p-8 text-white relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 italic">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Редагування
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex gap-2">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 1 ? "bg-white" : "bg-white/20"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 2 ? "bg-white" : "bg-white/20"}`} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#FBFBFF]">
          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  Назва турніру <Tooltip text="Зміна назви вплине на відображення в усіх списках" />
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#6D72F1] font-bold text-slate-800 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  Опис <Tooltip text="Ви можете оновити правила або деталі турніру" />
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#6D72F1] text-slate-700 font-medium shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-[1.5rem] space-y-4">
                  <span className="text-[10px] font-black text-[#6D72F1] uppercase tracking-widest block">Реєстрація</span>
                  <div className="space-y-3">
                    <DateTimePicker 
                      label="Відкриття"
                      value={formData.reg_start}
                      onChange={(date) => handleDateChange("reg_start", date)}
                    />
                    <DateTimePicker 
                      label="Закриття"
                      value={formData.reg_end}
                      onChange={(date) => handleDateChange("reg_end", date)}
                    />
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-[1.5rem] space-y-4 flex flex-col justify-center">
                  <span className="text-[10px] font-black text-[#6D72F1] uppercase tracking-widest block">Початок</span>
                  <DateTimePicker 
                    label="Дата старту"
                    value={formData.start_date}
                    onChange={(date) => handleDateChange("start_date", date)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { l: "Команд (Макс)", n: "max_teams" },
                  { l: "Гравців (Мін)", n: "min_people_in_team" },
                  { l: "Гравців (Макс)", n: "max_people_in_team" },
                ].map((f) => (
                  <div key={f.n} className="bg-white p-5 rounded-2xl border border-slate-200 text-center relative pt-8 shadow-sm">
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">{f.l}</label>
                    <input name={f.n} type="number" value={formData[f.n as keyof FormData] as number} onChange={handleChange} className="w-full bg-transparent text-2xl font-black text-slate-800 text-center outline-none" />
                  </div>
                ))}
              </div>

              <button type="button" onClick={() => setIsJuryModalOpen(true)} className="w-full p-8 border-2 border-dashed border-slate-200 rounded-[2rem] hover:bg-[#6D72F1]/5 hover:border-[#6D72F1] transition-all group bg-white">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-100 group-hover:bg-[#6D72F1] group-hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-inner">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <span className="font-bold text-slate-800 uppercase text-xs">Суддівська команда</span>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Залучено фахівців: {formData.juries.length}</p>
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
            onClick={currentStep === 1 ? () => setCurrentStep(2) : handleSave}
            disabled={isSubmitting || !canGoNext()}
            className="flex-[2] py-4 bg-[#6D72F1] text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-[#6D72F1]/20 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? "Збереження..." : currentStep === 1 ? "Далі" : "Зберегти зміни"}
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