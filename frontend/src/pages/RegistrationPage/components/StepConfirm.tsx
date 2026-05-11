import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icons";
import { BtnNext, BtnBack } from "./FormUI";
import type { RegFormData, TournamentConfig } from "../types";

interface StepConfirmProps {
  cfg: TournamentConfig;
  capName: string;
  captainEmail: string;
  onBack: () => void;
}

export const StepConfirm: React.FC<StepConfirmProps> = ({
  cfg,
  capName,
  captainEmail,
  onBack,
}) => {
  const { t } = useTranslation("registration");
  const { watch } = useFormContext<RegFormData>();
  const formValues = watch();
  const isSolo = formValues.format === "solo";

  return (
    <div>
      <h1 className="font-nunito font-extrabold text-[30px] text-text-main tracking-[-0.02em] mb-[5px] transition-colors">
        {t("step_3.title")}
      </h1>
      <p className="text-[15px] text-text-muted font-medium mb-6 transition-colors">
        {t("step_3.subtitle")}
      </p>

      <div className="bg-bg-card border-2 border-border rounded-[24px] overflow-hidden mb-5 transition-colors shadow-sm">
        <div className="bg-indigo-950 px-7 pt-7 pb-6 text-white relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-20px] font-nunito text-[60px] font-extrabold text-white/[0.03] tracking-[-0.03em] pointer-events-none select-none uppercase">
            UGalaxy
          </div>
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase opacity-60 mb-1.5 font-nunito relative z-10">
            {cfg.title}
          </div>
          <div className="font-nunito font-extrabold text-[24px] tracking-[-0.01em] leading-tight relative z-10">
            {formValues.teamName || capName}
          </div>
        </div>

        <div className="px-7 py-2">
          <div className="py-4 border-b border-border last:border-b-0 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <div className="text-primary">
                <Icon.User size={16} />
              </div>
              <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-text-muted font-nunito">
                {isSolo
                  ? t("step_3.labels.player")
                  : t("step_3.labels.captain")}
              </div>
            </div>
            <div className="ml-7 text-sm font-semibold text-text-main">
              {capName}{" "}
              <span className="text-text-muted font-normal mx-1.5">•</span>{" "}
              {captainEmail}
            </div>

            {cfg.customFields?.map((f) => {
              const val =
                formValues.customFields?.[
                  f.id as keyof typeof formValues.customFields
                ];
              if (!val) return null;
              return (
                <div key={f.id} className="ml-7 mt-1.5 text-[13px] flex gap-2">
                  <span className="text-text-muted">{f.label}:</span>
                  <span className="text-text-main font-medium">
                    {val as string}
                  </span>
                </div>
              );
            })}
          </div>

          {!isSolo && (formValues.members?.length ?? 0) > 0 && (
            <div className="py-4 border-b border-border last:border-b-0 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-primary">
                  <Icon.Users size={16} />
                </div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-text-muted font-nunito">
                  {t("step_3.labels.members")}
                </div>
              </div>

              <div className="ml-7 space-y-4">
                {formValues.members?.map((m, i) => (
                  <div key={i} className="relative">
                    <div className="text-sm font-semibold text-text-main">
                      {m.name}{" "}
                      <span className="text-text-muted font-normal mx-1.5">
                        •
                      </span>{" "}
                      {m.email}
                    </div>
                    {cfg.customFields?.map((f) => {
                      const val = (m as any).customFields?.[f.id];
                      if (!val) return null;
                      return (
                        <div key={f.id} className="mt-1 text-[12px] flex gap-2">
                          <span className="text-text-muted">{f.label}:</span>
                          <span className="text-text-main font-medium">
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 flex gap-3 items-start text-[13px] text-text-main leading-relaxed mb-8 transition-colors">
        <span className="shrink-0 mt-[1px] text-primary">
          <Icon.Info size={16} />
        </span>
        <span className="opacity-80 font-medium">{t("step_3.warning")}</span>
      </div>

      <div className="flex gap-3 mt-10">
        <BtnBack onClick={onBack} />
        <BtnNext>
          <Icon.Check size={20} strokeWidth={3} /> {t("step_3.submit_btn")}
        </BtnNext>
      </div>
    </div>
  );
};
