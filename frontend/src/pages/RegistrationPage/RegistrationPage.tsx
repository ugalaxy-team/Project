import React, { useState } from "react";
import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

import { TOURNAMENTS_DATA } from "../../data/mockTournaments";
import { BrandingPanel } from "../../components/ui/BrandingPanel";
import { Ticket3D } from "../../components/ui/Ticket3D";

import { makeSchema, type RegFormData, type TournamentConfig } from "./types";
import { StepsNav } from "./components/StepsNav";
import { StepGeneral } from "./components/StepGeneral";
import { StepMembers } from "./components/StepMembers";
import { StepConfirm } from "./components/StepConfirm";
import { StepSuccess } from "./components/StepSuccess";

export const RegistrationPage = () => {
  const { t } = useTranslation("registration");
  const navigate = useNavigate();
  const { id } = useParams();

  const user = {
    displayName: "izachoc",
    full_name: "Андрій Іванченко",
    email: "andriy.test@gmail.com",
    telegram: "@izachoc_dev",
    github: "izachoc-code",
    discord: "izachoc#1234",
  };

  const captainDisplayName = user?.full_name || user?.displayName || "Анонім";
  const captainEmail = user?.email || "";

  const foundTournament = TOURNAMENTS_DATA.find((t) => t.id === Number(id));
  if (!foundTournament) return <Navigate to="/tournaments" replace />;

  const cfg: TournamentConfig = {
    id: `UG-${String(foundTournament.id).padStart(3, "0")}`,
    title: foundTournament.title,
    minMembers: foundTournament.minMembers ?? 1,
    maxMembers: foundTournament.maxMembers ?? 5,
    customFields: foundTournament.customFields,
  };

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const methods = useForm<RegFormData>({
    resolver: zodResolver(makeSchema(cfg, t)),
    defaultValues: {
      format: cfg.maxMembers === 1 ? "solo" : "team",
      members: [],
      captainFullName: user?.full_name || "",
      customFields: {
        telegram: user?.telegram || "",
        github: user?.github || "",
        discord: user?.discord || "",
      },
    },
  });

  const { watch, handleSubmit, trigger } = methods;
  const formValues = watch();
  const isSolo = formValues.format === "solo";

  const capName = formValues.captainFullName?.trim() || captainDisplayName;
  const ticketTeamName = formValues.teamName?.trim() || capName;

  const onSubmit = async (data: RegFormData) => {
    const newId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(newId);
    setIsSuccess(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-body font-inter text-text-main transition-colors duration-500">
      <div className="w-full lg:w-[56%] h-screen flex flex-col overflow-hidden relative z-10 bg-bg-body">
        <div className="px-6 lg:px-11 pt-7 flex items-center justify-between shrink-0">
          <Link
            to="/"
            className="font-quicksand font-extrabold text-[22px] md:text-[24px] text-text-main tracking-[-0.01em] hover:opacity-80 transition-all flex items-center gap-2"
          >
            <span>{t("brand", "UGalaxy")}</span>
            <span className="text-primary opacity-90 px-0.5">×</span>
            <span>Star for Life</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted font-quicksand transition-colors">
            <span className="opacity-50">
              {t("breadcrumbs.tournaments", "Турніри")}
            </span>
            <span className="opacity-30">/</span>
            <span className="text-primary/80">
              {t("breadcrumbs.registration", "Реєстрація")}
            </span>
          </div>
        </div>

        <StepsNav step={step} isSolo={isSolo} />

        <div className="flex-1 overflow-y-auto px-6 lg:px-11 pt-8 pb-16 no-scrollbar">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <StepSuccess key="success" onHome={() => navigate("/")} />
                ) : (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {step === 1 && (
                      <StepGeneral
                        cfg={cfg}
                        captainDisplayName={captainDisplayName}
                        captainEmail={captainEmail}
                        onNext={async () => {
                          const ok = await trigger([
                            "teamName",
                            "customFields",
                          ]);
                          if (ok) setStep(isSolo ? 3 : 2);
                        }}
                      />
                    )}
                    {step === 2 && !isSolo && (
                      <StepMembers
                        cfg={cfg}
                        captainEmail={captainEmail}
                        onNext={async () => {
                          const ok = await trigger("members");
                          if (ok) setStep(3);
                        }}
                        onBack={() => setStep(1)}
                      />
                    )}
                    {step === 3 && (
                      <StepConfirm
                        cfg={cfg}
                        capName={capName}
                        captainEmail={captainEmail}
                        onBack={() => setStep(isSolo ? 1 : 2)}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </FormProvider>
        </div>
      </div>

      <BrandingPanel className="hidden lg:flex">
        <Ticket3D
          eventTitle={cfg.title}
          format={formValues.format}
          teamName={ticketTeamName}
          captainName={capName}
          members={(formValues.members ?? []).map((m) => ({ name: m.name }))}
        />
      </BrandingPanel>
    </div>
  );
};
