import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { getAllUsers } from "@/api/requests/getAllUsers";
import { JurySelectionModal } from "./components/JurySelectionModal";
import { type User } from "./components/types";
import DateTimePicker from "@/components/ui/DateTimePicker";
import { toNaiveApiDateTime, toPickerDateTimeValue } from "@/utils/naiveDateTime";

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
    <div className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-primary hover:text-white transition-all">?</div>
    <div className="absolute top-6 left-0 hidden group-hover:block w-52 p-3 bg-bg-card text-text-muted text-[11px] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-border z-[100] leading-normal animate-in fade-in zoom-in duration-200">
      <div className="relative z-[101] font-semibold">{text}</div>
      <div className="absolute -top-1 left-1.5 border-4 border-transparent border-b-bg-card"></div>
    </div>
  </div>
);

export const EditTournamentModal: React.FC<EditTournamentModalProps> = ({
  isOpen,
  onClose,
  tournament,
  onSave,
}) => {
  const { t } = useTranslation("modals");
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
          start_date: toPickerDateTimeValue(tournament.start_date || ""),
          reg_start: toPickerDateTimeValue(tournament.reg_start || ""),
          reg_end: toPickerDateTimeValue(tournament.reg_end || ""),
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
        start_date: formData.start_date ? toNaiveApiDateTime(formData.start_date) : null,
        reg_start: formData.reg_start ? toNaiveApiDateTime(formData.reg_start) : null,
        reg_end: formData.reg_end ? toNaiveApiDateTime(formData.reg_end) : null,
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm dark:bg-black/70">
      <div className="bg-bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        <div className="bg-primary p-8 text-white relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 italic">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              {t("edit_tournament.title")}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-bg-card/10 rounded-full transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex gap-2">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 1 ? "bg-bg-card" : "bg-bg-card/20"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 2 ? "bg-bg-card" : "bg-bg-card/20"}`} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-bg-body">
          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center">
                  {t("edit_tournament.title_label")} <Tooltip text={t("edit_tournament.title_tooltip")} />
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-bg-card border border-border rounded-2xl outline-none focus:border-primary font-bold text-text-main shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center">
                  {t("fields.description")} <Tooltip text={t("edit_tournament.description_tooltip")} />
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-5 py-4 bg-bg-card border border-border rounded-2xl outline-none focus:border-primary text-text-main font-medium shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-bg-card border border-border rounded-[1.5rem] space-y-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest block">{t("fields.registration")}</span>
                  <div className="space-y-3">
                    <DateTimePicker 
                      label={t("fields.opening")}
                      value={formData.reg_start}
                      onChange={(date) => handleDateChange("reg_start", date)}
                    />
                    <DateTimePicker 
                      label={t("fields.closing")}
                      value={formData.reg_end}
                      onChange={(date) => handleDateChange("reg_end", date)}
                    />
                  </div>
                </div>

                <div className="p-5 bg-bg-card border border-border rounded-[1.5rem] space-y-4 flex flex-col justify-center">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest block">{t("fields.start")}</span>
                  <DateTimePicker 
                    label={t("fields.start_date")}
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
                  { l: t("edit_tournament.max_teams"), n: "max_teams" },
                  { l: t("edit_tournament.min_players"), n: "min_people_in_team" },
                  { l: t("edit_tournament.max_players"), n: "max_people_in_team" },
                ].map((f) => (
                  <div key={f.n} className="bg-bg-card p-5 rounded-2xl border border-border text-center relative pt-8 shadow-sm">
                    <label className="text-[9px] font-black text-text-muted uppercase block mb-1">{f.l}</label>
                    <input name={f.n} type="number" value={formData[f.n as keyof FormData] as number} onChange={handleChange} className="w-full bg-transparent text-2xl font-black text-text-main text-center outline-none" />
                  </div>
                ))}
              </div>

              <button type="button" onClick={() => setIsJuryModalOpen(true)} className="w-full p-8 border-2 border-dashed border-border rounded-[2rem] hover:bg-primary/5 hover:border-primary transition-all group bg-bg-card">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-bg-body group-hover:bg-primary group-hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-inner">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <span className="font-bold text-text-main uppercase text-xs">{t("edit_tournament.jury_team")}</span>
                  <p className="text-[10px] font-bold text-text-muted tracking-widest uppercase">{t("edit_tournament.jury_count", { count: formData.juries.length })}</p>
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-bg-card border-t flex gap-4">
          <button onClick={currentStep === 1 ? onClose : () => setCurrentStep(1)} className="flex-1 py-4 font-bold text-text-muted uppercase text-[10px] tracking-widest hover:text-text-muted transition-colors">
            {currentStep === 1 ? t("common.cancel") : t("common.back")}
          </button>
          <button
            onClick={currentStep === 1 ? () => setCurrentStep(2) : handleSave}
            disabled={isSubmitting || !canGoNext()}
            className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 disabled:bg-border disabled:text-text-muted transition-all active:scale-[0.98]"
          >
            {isSubmitting ? t("edit_tournament.saving") : currentStep === 1 ? t("common.next") : t("edit_tournament.save")}
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