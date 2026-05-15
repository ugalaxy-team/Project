import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import type { RootState } from "@/store";
import apiClient from "../../api/client";
import {
  createTeam,
  type CreateTeamPayload,
} from "../../api/requests/createTeam";

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

  const user = useSelector((state: RootState) => state.user.user);
  const captainDisplayName = user?.full_name || user?.displayName || "";
  const captainEmail = user?.email || "";

  const {
    data: foundTournament,
    isLoading: isTournamentLoading,
    isError: isTournamentError,
  } = useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      const res = await apiClient.get(`/tournaments/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const cfg: TournamentConfig = foundTournament
    ? {
        id: `UG-${String(foundTournament.id).padStart(3, "0")}`,
        title: foundTournament.title,
        minMembers: foundTournament.min_people_in_team ?? 2,
        maxMembers: foundTournament.max_people_in_team ?? 5,
      }
    : { id: "", title: "", minMembers: 2, maxMembers: 5 };

  const methods = useForm<RegFormData>({
    resolver: zodResolver(makeSchema(cfg, t)),
    shouldUnregister: false,
    defaultValues: {
      format: "team",
      teamName: "",
      teamPhone: "",
      captainFullName: captainDisplayName,
      captainTelegram: user?.telegram || "",
      captainInstitution: "",
      members: [],
    },
  });

  const {
    watch,
    handleSubmit,
    trigger,
    reset,
    getValues,
    formState: { errors: formErrors },
  } = methods;
  const formValues = watch();

  const capName = formValues.captainFullName?.trim() || captainDisplayName;
  const ticketTeamName = formValues.teamName?.trim() || capName;

  useEffect(() => {
    if (user) {
      reset({
        format: "team",
        teamName: getValues("teamName") || "",
        teamPhone: getValues("teamPhone") || "",
        captainFullName:
          getValues("captainFullName") ||
          user.full_name ||
          user.displayName ||
          "",
        captainTelegram: getValues("captainTelegram") || user.telegram || "",
        captainInstitution: getValues("captainInstitution") || "",
        members: getValues("members") || [],
      });
    }
  }, [user, reset]);

  const createTeamMutation = useMutation({
    mutationFn: (payload: CreateTeamPayload) => createTeam(Number(id), payload),
    onSuccess: () => setIsSuccess(true),
    onError: (error: any) => {
      console.error("Registration error:", error);
      setServerError(
        error.response?.data?.detail?.[0]?.msg || t("errors.server_default"),
      );
    },
  });

  const onSubmit = async (data: RegFormData) => {
    setServerError("");

    const payload: CreateTeamPayload = {
      name: data.teamName?.trim() || "",
      team_email: captainEmail,
      contact_info: data.teamPhone?.trim() || "",
      captain: {
        full_name: capName,
        email: captainEmail,
        telegram: data.captainTelegram?.trim() || "",
        educational_institution: data.captainInstitution?.trim() || "",
      },
      members: (data.members || []).map((m) => ({
        full_name: m.name,
        email: m.email,
        telegram: m.telegram?.trim() || "",
        educational_institution: m.institution?.trim() || "",
      })),
    };

    createTeamMutation.mutate(payload);
  };

  if (isTournamentLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-body">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isTournamentError || !foundTournament) {
    return <Navigate to="/tournaments" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-body font-inter text-text-main transition-colors duration-500">
      <div className="w-full lg:w-[56%] h-screen flex flex-col overflow-hidden relative z-10 bg-bg-body">
        <div className="px-6 lg:px-11 pt-7 flex items-center justify-between shrink-0">
          <Link
            to="/"
            className="font-nunito font-extrabold text-[22px] md:text-[24px] text-text-main tracking-[-0.01em] hover:opacity-80 transition-all flex items-center gap-2"
          >
            <span>{t("brand")}</span>
            <span className="text-primary opacity-90 px-0.5">×</span>
            <span>Star for Life</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted font-nunito transition-colors">
            <span className="opacity-50">{t("breadcrumbs.tournaments")}</span>
            <span className="opacity-30">/</span>
            <span className="text-primary/80">
              {t("breadcrumbs.registration")}
            </span>
          </div>
        </div>

        <StepsNav step={step} isSolo={false} />

        <div className="flex-1 overflow-y-auto px-6 lg:px-11 pt-8 pb-16 no-scrollbar">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit, (err) =>
                console.log("Помилки валідації:", err),
              )}
            >
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
                            "teamPhone",
                            "captainFullName",
                            "captainTelegram",
                            "captainInstitution",
                          ]);
                          if (ok) setStep(2);
                        }}
                      />
                    )}
                    {step === 2 && (
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
                        onBack={() => setStep(2)}
                        isSubmitting={createTeamMutation.isPending}
                        serverError={serverError}
                        formErrors={formErrors}
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
