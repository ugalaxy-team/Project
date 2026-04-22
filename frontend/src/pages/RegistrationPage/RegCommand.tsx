import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, BrandingPanel, Ticket3D } from "../../components/ui";

// Схема валідації
const regSchema = z
  .object({
    format: z.enum(["team", "solo"]),
    teamName: z.string().optional(),
    captainFullName: z.string().optional(),
    organization: z.string().optional(),
    telegram: z.string().min(2, "errors.tg_required"),
    members: z.array(
      z.object({
        firstName: z.string().min(2, "errors.name_short"),
        email: z.string().email("errors.email_invalid"),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (
      data.format === "team" &&
      (!data.teamName || data.teamName.length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.team_name_required",
        path: ["teamName"],
      });
    }
  });

type RegFormData = z.infer<typeof regSchema>;

export const RegPage = () => {
  const { t } = useTranslation("registration");
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Дані турніру (можна потім витягувати з API або пропсів)
  const tournament = { title: "Бокс в костюмі динозаврів", min: 1, max: 4 };

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegFormData>({
    resolver: zodResolver(regSchema),
    defaultValues: { format: "team", members: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });
  const formValues = watch();

  const onSubmit = async (data: RegFormData) => {
    // Тут буде твій запит до API
    console.log("Sending data to UGalaxy backend:", data);
    setIsSuccess(true);
  };

  const handleNext = () => {
    if (step === 1 && formValues.format === "solo") setStep(3);
    else setStep((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-inter text-slate-900">
      {/* ЛІВА ЧАСТИНА: ФОРМА */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Хедер форми */}
        <div className="p-6 px-11 flex justify-between items-center shrink-0">
          <div className="font-quicksand font-extrabold text-2xl text-indigo-500">
            UGalaxy
          </div>
          <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            {t("badge_open")}
          </div>
        </div>

        {/* Навігація кроків */}
        <div className="px-11 mb-8 shrink-0">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-sm font-bold transition-all ${step === s ? "border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-200" : step > s ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 text-slate-400"}`}
                  >
                    {step > s ? "✓" : s}
                  </div>
                  <span
                    className={`font-quicksand font-bold text-sm hidden sm:block ${step === s ? "text-indigo-600" : "text-slate-400"}`}
                  >
                    {t(
                      `steps.${s === 1 ? "general" : s === 2 ? "members" : "confirm"}`,
                    )}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full ${step > s ? "bg-emerald-500" : "bg-slate-200"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Контент форми з прокруткою */}
        <div className="flex-1 overflow-y-auto px-11 pb-16">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-xl"
              >
                {/* STEP 1: GENERAL */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h1 className="text-3xl font-extrabold font-quicksand">
                      {t("step1.title")}
                    </h1>
                    <p className="text-slate-500 font-medium">
                      {t("step1.tournament")}:{" "}
                      <span className="text-slate-900 font-bold">
                        {tournament.title}
                      </span>
                    </p>

                    <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                      {["team", "solo"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {}}
                          className={`flex-1 py-3 rounded-xl font-bold font-quicksand text-sm transition-all ${formValues.format === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                        >
                          {t(`step1.formats.${f}`)}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {formValues.format === "team" && (
                        <div>
                          <label className="block text-sm font-bold mb-2">
                            {t("step1.team_name_label")}
                          </label>
                          <input
                            {...register("teamName")}
                            className={`w-full px-5 py-3 border-2 rounded-full outline-none transition-all ${errors.teamName ? "border-red-500" : "border-slate-200 focus:border-indigo-500"}`}
                            placeholder={t("step1.team_name_placeholder")}
                          />
                        </div>
                      )}

                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                        <AlertTriangle
                          className="text-amber-500 shrink-0"
                          size={18}
                        />
                        <p className="text-xs text-amber-800 font-medium">
                          {t("step1.captain_notice")}
                        </p>
                      </div>

                      <input
                        {...register("captainFullName")}
                        className="w-full px-5 py-3 border-2 border-slate-200 rounded-full focus:border-indigo-500 outline-none"
                        placeholder={t("step1.full_name_label")}
                      />
                      <input
                        {...register("organization")}
                        className="w-full px-5 py-3 border-2 border-slate-200 rounded-full focus:border-indigo-500 outline-none"
                        placeholder={t("step1.org_placeholder")}
                      />
                      <input
                        {...register("telegram")}
                        className={`w-full px-5 py-3 border-2 rounded-full outline-none transition-all ${errors.telegram ? "border-red-500" : "border-slate-200 focus:border-indigo-500"}`}
                        placeholder="@username"
                      />
                    </div>

                    <Button
                      onClick={handleNext}
                      className="w-full py-7 text-base rounded-full mt-4"
                    >
                      {t("step1.next")} <ChevronRight size={20} />
                    </Button>
                  </div>
                )}

                {/* STEP 2: MEMBERS */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h1 className="text-3xl font-extrabold font-quicksand">
                      {t("step2.title")}
                    </h1>
                    <p className="text-slate-500 font-medium">
                      {t("step2.subtitle", {
                        min: tournament.min,
                        max: tournament.max,
                      })}
                    </p>

                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="p-5 border-2 border-slate-100 rounded-[24px] bg-white group hover:border-indigo-100 transition-all"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-slate-300">
                              #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-slate-300 hover:text-red-500"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              {...register(`members.${index}.firstName`)}
                              className="px-4 py-2.5 border-2 border-slate-100 rounded-full focus:border-indigo-500 outline-none text-sm"
                              placeholder="Ім'я"
                            />
                            <input
                              {...register(`members.${index}.email`)}
                              className="px-4 py-2.5 border-2 border-slate-100 rounded-full focus:border-indigo-500 outline-none text-sm"
                              placeholder="Email"
                            />
                          </div>
                        </div>
                      ))}

                      {fields.length < tournament.max && (
                        <button
                          type="button"
                          onClick={() => append({ firstName: "", email: "" })}
                          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[24px] text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-indigo-300 hover:text-indigo-500 transition-all"
                        >
                          <Plus size={18} /> {t("step2.add_member")}
                        </button>
                      )}
                    </div>

                    <div className="flex gap-4 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="px-8 rounded-full"
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        onClick={handleNext}
                        className="flex-1 py-7 rounded-full shadow-lg shadow-indigo-100"
                      >
                        {t("step2.next")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: CONFIRM */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h1 className="text-3xl font-extrabold font-quicksand">
                      {t("step3.title")}
                    </h1>
                    <div className="p-6 bg-indigo-600 rounded-[32px] text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="text-[11px] font-bold opacity-70 uppercase tracking-widest mb-1">
                          {tournament.title}
                        </div>
                        <div className="text-2xl font-bold">
                          {formValues.format === "solo"
                            ? formValues.captainFullName || "Андрій"
                            : formValues.teamName}
                        </div>
                      </div>
                      <div className="absolute -right-4 -bottom-4 text-white/5 font-black text-6xl">
                        UGALAXY
                      </div>
                    </div>
                    <Button
                      onClick={handleSubmit(onSubmit)}
                      className="w-full py-7 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                    >
                      {t("step3.submit")}{" "}
                      <CheckCircle2 size={20} className="ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setStep(formValues.format === "solo" ? 1 : 2)
                      }
                      className="w-full py-4 rounded-full border-none text-slate-400 font-bold"
                    >
                      {t("Назад")}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h1 className="text-3xl font-black font-quicksand mb-4">
                  {t("success.title")}
                </h1>
                <Button
                  onClick={() => window.location.reload()}
                  className="px-12 py-4 rounded-full"
                >
                  {t("success.back_home")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ПРАВА ЧАСТИНА: БРЕНДИНГ ТА КВИТОК */}
      <BrandingPanel position="right" width="44%">
        <Ticket3D
          eventTitle={tournament.title}
          format={formValues.format}
          teamName={
            formValues.format === "solo" ? "" : formValues.teamName || ""
          }
          captainName={formValues.captainFullName || "Андрій (izachoc)"}
          members={formValues.members}
        />

        {/* Статистика знизу */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 text-white z-20">
          <div className="text-center">
            <div className="text-2xl font-extrabold">
              {formValues.members.length + 1}
            </div>
            <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
              {t("ticket.stats.members")}
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-extrabold">5</div>
            <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
              {t("ticket.stats.tournament_no")}
            </div>
          </div>
        </div>
      </BrandingPanel>
    </div>
  );
};
