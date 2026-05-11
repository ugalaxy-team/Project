import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getAllUsers } from "@/api/requests/getAllUsers";
import { JurySelectionModal } from "./components/JurySelectionModal";
import { type User } from "./components/types";

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
  juries?: any[]; // Бекенд може присилати об'єкти
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

  const formatForInput = (isoString?: string | null) => {
    if (!isoString) return "";
    return isoString.substring(0, 16);
  };

  useEffect(() => {
    if (isOpen) {
      getAllUsers().then(setAllUsers).catch(console.error);
      document.body.style.overflow = "hidden";

      if (tournament) {
        // ЖОРСТКА ФІЛЬТРАЦІЯ: витягуємо тільки ID з масиву, що прийшов від сервера
        const initialJuries = (tournament.juries || []).map((j: any) =>
          typeof j === "object" && j !== null ? j.id : Number(j)
        );

        setFormData({
          title: tournament.title || "",
          description: tournament.description || "",
          start_date: formatForInput(tournament.start_date),
          reg_start: formatForInput(tournament.reg_start),
          reg_end: formatForInput(tournament.reg_end),
          max_teams: tournament.max_teams || 2,
          min_people_in_team: tournament.min_people_in_team || 1,
          max_people_in_team: tournament.max_people_in_team || 5,
          juries: initialJuries, // Тепер тут лежить масив типу [1, 2, 3]
        });
      }
      setCurrentStep(1);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, tournament]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numberFields = ["max_teams", "min_people_in_team", "max_people_in_team"];
    
    setFormData((prev) => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      return (
        formData.title.trim() !== "" &&
        formData.description.trim() !== ""
      );
    }
    if (currentStep === 2) {
      return (
        formData.max_teams > 0 &&
        formData.min_people_in_team > 0 &&
        formData.max_people_in_team >= formData.min_people_in_team
      );
    }
    return true;
  };

  const handleNext = () => {
    if (canGoNext()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleSave = async () => {
    if (!canGoNext() || !tournament) return;

    setIsSubmitting(true);

    try {
      // Для стовідсоткової певності перед відправкою ще раз перетворюємо на Number
      const dataToSubmit: UpdateTournamentData = {
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : null,
        reg_start: formData.reg_start
          ? new Date(formData.reg_start).toISOString()
          : null,
        reg_end: formData.reg_end
          ? new Date(formData.reg_end).toISOString()
          : null,
        max_teams: formData.max_teams,
        min_people_in_team: formData.min_people_in_team,
        max_people_in_team: formData.max_people_in_team,
        juries: formData.juries.map(Number), // [1, 2, 3]
      };

      await onSave(tournament.id, dataToSubmit);
      onClose();
    } catch (e) {
      console.error("Помилка при збереженні", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl shadow-[#6D72F1]/25 overflow-hidden flex flex-col max-h-[94vh] relative animate-fadeIn">
          <div className="bg-[#6D72F1] p-8 text-white relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                  РЕДАГУВАТИ
                </h2>

                <p className="text-white/80 text-xs font-bold uppercase tracking-[0.3em] mt-1.5">
                  КРОК {currentStep} З 2 • ТУРНІР #{tournament?.id}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 hover:rotate-90 rounded-full transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex gap-3 mt-8">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    currentStep >= s
                      ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-[#FBFBFF] relative z-10">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Назва івенту
                  </label>

                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Наприклад: Global Cyber Cup"
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#6D72F1] focus:ring-4 focus:ring-[#6D72F1]/10 shadow-sm font-bold text-slate-700 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Про турнір
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Короткий опис для учасників..."
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#6D72F1] focus:ring-4 focus:ring-[#6D72F1]/10 shadow-sm font-medium text-slate-600 resize-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4 hover:border-slate-300 transition-colors">
                    <span className="text-[#6D72F1] font-black uppercase text-xs tracking-widest block mb-1">
                      Реєстрація
                    </span>

                    <input
                      name="reg_start"
                      type="datetime-local"
                      value={formData.reg_start}
                      onChange={handleChange}
                      style={{ colorScheme: "light" }}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl text-sm font-bold text-slate-700 outline-none border border-slate-200 focus:border-[#6D72F1] focus:ring-4 focus:ring-[#6D72F1]/10 transition-all cursor-pointer"
                    />

                    <input
                      name="reg_end"
                      type="datetime-local"
                      value={formData.reg_end}
                      onChange={handleChange}
                      style={{ colorScheme: "light" }}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl text-sm font-bold text-slate-700 outline-none border border-slate-200 focus:border-[#6D72F1] focus:ring-4 focus:ring-[#6D72F1]/10 transition-all cursor-pointer"
                    />
                  </div>

                  <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between">
                    <div>
                      <span className="text-[#6D72F1] font-black uppercase text-xs tracking-widest block mb-1">
                        Початок івенту
                      </span>

                      <input
                        name="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={handleChange}
                        style={{ colorScheme: "light" }}
                        className="w-full p-3 mt-4 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl text-sm font-bold text-slate-700 outline-none border border-slate-200 focus:border-[#6D72F1] focus:ring-4 focus:ring-[#6D72F1]/10 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center focus-within:border-[#6D72F1] focus-within:ring-4 focus-within:ring-[#6D72F1]/10 transition-all">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">
                      Команд (Макс)
                    </label>

                    <input
                      name="max_teams"
                      type="number"
                      min="1"
                      value={formData.max_teams}
                      onChange={handleChange}
                      className="w-full bg-transparent text-3xl font-black text-[#6D72F1] outline-none text-center"
                    />
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center focus-within:border-[#6D72F1] focus-within:ring-4 focus-within:ring-[#6D72F1]/10 transition-all">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">
                      Гравців (Мін)
                    </label>

                    <input
                      name="min_people_in_team"
                      type="number"
                      min="1"
                      value={formData.min_people_in_team}
                      onChange={handleChange}
                      className="w-full bg-transparent text-3xl font-black text-[#6D72F1] outline-none text-center"
                    />
                  </div>

                  <div className={`bg-white p-4 rounded-2xl border shadow-sm text-center focus-within:border-[#6D72F1] focus-within:ring-4 focus-within:ring-[#6D72F1]/10 transition-all ${formData.max_people_in_team < formData.min_people_in_team ? 'border-red-400' : 'border-slate-200'}`}>
                    <label className={`text-[10px] font-black uppercase block mb-3 tracking-widest ${formData.max_people_in_team < formData.min_people_in_team ? 'text-red-400' : 'text-slate-400'}`}>
                      Гравців (Макс)
                    </label>

                    <input
                      name="max_people_in_team"
                      type="number"
                      min="1"
                      value={formData.max_people_in_team}
                      onChange={handleChange}
                      className={`w-full bg-transparent text-3xl font-black outline-none text-center ${formData.max_people_in_team < formData.min_people_in_team ? 'text-red-500' : 'text-[#6D72F1]'}`}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsJuryModalOpen(true)}
                  className="w-full p-10 bg-white border-2 border-dashed border-slate-300 hover:border-[#6D72F1] hover:bg-[#6D72F1]/5 transition-all duration-300 group rounded-3xl"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-20 h-20 bg-[#6D72F1] text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-[#6D72F1]/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-slate-800 uppercase italic mb-1">
                        Суддівська Колегія
                      </h4>

                      <p className="text-sm font-medium text-slate-500">
                        {formData.juries.length > 0 ? (
                          <span className="text-[#6D72F1] font-bold">
                            Обрано: {formData.juries.length} експертів
                          </span>
                        ) : (
                          "Натисніть, щоб змінити склад суддів"
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-4 relative z-10">
            <button
              onClick={
                currentStep === 1
                  ? onClose
                  : () => setCurrentStep((s) => s - 1)
              }
              className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm uppercase tracking-widest transition-all"
            >
              {currentStep === 1 ? "Скасувати" : "Назад"}
            </button>

            <button
              onClick={currentStep === 2 ? handleSave : handleNext}
              disabled={isSubmitting || !canGoNext()}
              className="flex-[2] py-4 bg-[#6D72F1] hover:bg-[#5B60E0] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#6D72F1]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0"
            >
              {isSubmitting
                ? "Збереження..."
                : currentStep === 2
                ? "Зберегти Зміни"
                : "Далі"}
            </button>
          </div>
        </div>
      </div>

      {isJuryModalOpen &&
        createPortal(
          <JurySelectionModal
            isOpen={isJuryModalOpen}
            onClose={() => setIsJuryModalOpen(false)}
            allUsers={allUsers}
            addedJurors={formData.juries}
            onToggleJuror={(id: number) => {
              const next = formData.juries.includes(id)
                ? formData.juries.filter((i) => i !== id)
                : [...formData.juries, id];

              setFormData((p) => ({
                ...p,
                juries: next,
              }));
            }}
            selectedTournament={{
              title: formData.title,
            } as any}
            onSave={() => setIsJuryModalOpen(false)}
          />,
          document.body
        )}
    </>,
    document.body
  );
};