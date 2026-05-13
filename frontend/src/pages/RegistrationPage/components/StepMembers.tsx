import React, { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icons";
import { FieldInput, BtnNext, BtnBack } from "./FormUI";
import type { RegFormData, TournamentConfig } from "../types";

interface StepMembersProps {
  cfg: TournamentConfig;
  captainEmail: string;
  onNext: () => void;
  onBack: () => void;
}

export const StepMembers: React.FC<StepMembersProps> = ({
  cfg,
  captainEmail,
  onNext,
  onBack,
}) => {
  const { t } = useTranslation("registration");
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<RegFormData>();
  const [membersError, setMembersError] = useState("");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });

  const maxTeammates = Math.max(0, cfg.maxMembers - 1);
  const minTeammates = Math.max(1, cfg.minMembers - 1);

  const handleNextClick = () => {
    if (fields.length < minTeammates) {
      setMembersError(t("step_2.errors.min_members", { count: minTeammates }));
      return;
    }

    const capEm = captainEmail.toLowerCase();
    const memberEmails = fields.map(
      (_, i) => getValues(`members.${i}.email`)?.toLowerCase() ?? "",
    );
    const all = [capEm, ...memberEmails];
    const dupes = all.filter((e, i) => e && all.indexOf(e) !== i);

    if (dupes.length) {
      setMembersError(
        t("step_2.errors.duplicate_email", {
          emails: [...new Set(dupes)].join(", "),
        }),
      );
      return;
    }

    setMembersError("");
    onNext();
  };

  return (
    <div>
      <h1 className="font-nunito font-extrabold text-[30px] text-text-main tracking-[-0.02em] mb-[5px] transition-colors">
        {t("step_2.title")}
      </h1>
      <p className="text-[15px] text-text-muted font-medium mb-8 transition-colors">
        {t("step_2.subtitle_1")}{" "}
        <strong className="text-text-main font-bold">{minTeammates}</strong>{" "}
        {t("step_2.subtitle_2")}{" "}
        <strong className="text-text-main font-bold">{maxTeammates}</strong>{" "}
        {t("step_2.subtitle_3")}
      </p>

      <div className="bg-bg-card border-2 border-border/60 rounded-[20px] p-5 mb-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3.5 transition-colors">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-nunito flex items-center gap-2">
            <Icon.Team size={14} /> {t("step_2.counter.label")}
          </div>
          <div className="text-[13px] font-bold text-text-muted bg-border/40 px-3 py-1 rounded-full">
            <span className="text-primary">{fields.length}</span> /{" "}
            {maxTeammates}
          </div>
        </div>
        <div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden transition-colors relative">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-primary rounded-full"
              animate={{ width: `${(fields.length / maxTeammates) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2.5 text-[10px] text-text-muted/70 font-bold uppercase tracking-wider">
            <span>
              {t("step_2.counter.min")} {minTeammates}
            </span>
            <span>
              {t("step_2.counter.max")} {maxTeammates}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {fields.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="border-2 border-dashed border-text-muted/30 rounded-[20px] py-10 px-5 flex flex-col items-center justify-center text-center transition-colors">
              <div className="w-14 h-14 rounded-full bg-border/50 text-text-muted flex items-center justify-center mb-4 transition-colors">
                <span className="scale-125 opacity-80">
                  <Icon.Team size={24} />
                </span>
              </div>
              <div className="text-text-main font-bold text-[15px] mb-1">
                {t("step_2.empty_title")}
              </div>
              <div className="text-text-muted text-[13px] font-medium">
                {t("step_2.empty_state")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 mb-5">
        <AnimatePresence>
          {fields.map((field, index) => {
            const memberErrors = errors.members?.[index];

            return (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.28 }}
                className="bg-bg-card border-2 border-primary/10 rounded-[20px] p-5 transition-colors shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-300" />

                <div className="flex items-center justify-between mb-5">
                  <div className="font-nunito text-[14px] font-bold text-text-main flex items-center gap-2.5 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] shrink-0">
                      {index + 1}
                    </div>
                    {t("step_2.participant_label")} {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="w-8 h-8 rounded-full border border-border bg-transparent text-text-muted flex items-center justify-center transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 cursor-pointer"
                    title={t("step_2.remove_btn")}
                  >
                    <Icon.X size={14} strokeWidth={3} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-nunito text-[11px] font-bold text-text-muted mb-2 uppercase tracking-wide">
                      {t("step_2.labels.name")}{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <FieldInput
                      {...register(`members.${index}.name`)}
                      placeholder={t("step_2.placeholders.name")}
                      autoComplete="off"
                      hasError={!!memberErrors?.name}
                    />
                    {memberErrors?.name && (
                      <p className="text-[12px] text-red-500 mt-2 pl-3 font-medium">
                        {memberErrors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block font-nunito text-[11px] font-bold text-text-muted mb-2 uppercase tracking-wide">
                      {t("step_2.labels.email")}{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <FieldInput
                      {...register(`members.${index}.email`)}
                      type="email"
                      placeholder={t("step_2.placeholders.email")}
                      autoComplete="off"
                      hasError={!!memberErrors?.email}
                    />
                    {memberErrors?.email && (
                      <p className="text-[12px] text-red-500 mt-2 pl-3 font-medium">
                        {memberErrors.email.message}
                      </p>
                    )}
                  </div>

                  {cfg.customFields?.map((cField) => {
                    const customError = (memberErrors as any)?.customFields?.[
                      cField.id
                    ];

                    return (
                      <div key={cField.id}>
                        <label className="block font-nunito text-[11px] font-bold text-text-muted mb-2 uppercase tracking-wide">
                          {cField.label}{" "}
                          {cField.required && (
                            <span className="text-primary">*</span>
                          )}
                        </label>
                        <FieldInput
                          {...register(
                            `members.${index}.customFields.${cField.id}` as any,
                          )}
                          placeholder={cField.placeholder || ""}
                          autoComplete="off"
                          hasError={!!customError}
                        />
                        {customError && (
                          <p className="text-[12px] text-red-500 mt-2 pl-3 font-medium">
                            {customError.message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => {
          if (fields.length < maxTeammates) {
            append({ name: "", email: "", customFields: {} } as any);
            setMembersError("");
          }
        }}
        disabled={fields.length >= maxTeammates}
        className="w-full py-4 bg-transparent border-2 border-dashed border-text-muted/30 rounded-[20px] font-nunito text-[14px] font-bold text-text-muted flex items-center justify-center gap-2 transition-all duration-300 hover:not:disabled:border-primary hover:not:disabled:text-primary hover:not:disabled:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Icon.Plus size={16} strokeWidth={2.5} /> {t("step_2.add_btn")}
      </button>

      <AnimatePresence>
        {membersError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-medium p-4 rounded-2xl mt-5 flex items-center gap-3"
          >
            <span className="shrink-0">
              <Icon.Info size={16} />
            </span>
            {membersError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 mt-10">
        <BtnBack onClick={onBack} />
        <BtnNext onClick={handleNextClick}>
          {t("step_2.next_btn")}{" "}
          <Icon.ChevronRight size={18} strokeWidth={2.5} />
        </BtnNext>
      </div>
    </div>
  );
};
