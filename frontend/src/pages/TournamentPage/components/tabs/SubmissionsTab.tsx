import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  UploadCloud,
  Link as LinkIcon,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { createSubmission } from "../../../../api/requests/createSubmission";

interface SubmissionsTabProps {
  tournament: any;
  activeTaskId?: number;
  userTeamId?: number;
}

export const SubmissionsTab = ({
  tournament,
  activeTaskId,
  userTeamId,
}: SubmissionsTabProps) => {
  const { t } = useTranslation("tournament");
  const [submissionLink, setSubmissionLink] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const isRunning = tournament.status?.name === "running";

  const submitTask = useMutation({
    mutationFn: async (link: string) => {
      if (!activeTaskId) throw new Error("Task ID is missing");
      if (!userTeamId) throw new Error("Team ID is missing");

      return createSubmission(tournament.id, activeTaskId, {
        team_id: userTeamId,
        urls: [
          {
            url_id: "github",
            value: link,
          },
        ],
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      setSubmissionLink("");
    },
    onError: (error) => {
      console.error("Помилка відправки роботи:", error);
    },
  });

  const handleSubmit = () => {
    if (!submissionLink.trim() || !activeTaskId || !userTeamId) return;
    submitTask.mutate(submissionLink);
  };

  if (!isRunning) {
    return (
      <div className="py-20 text-center flex flex-col items-center animate-[fadeIn_0.5s_ease_forwards]">
        <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center border border-border mb-6 shadow-sm transition-colors duration-300">
          <UploadCloud
            className="w-9 h-9 text-text-main transition-colors duration-300"
            strokeWidth={1.5}
          />
        </div>
        <h3 className="text-[22px] md:text-[26px] font-bold text-text-main mb-2 transition-colors duration-300">
          {t("submissions.closed.title")}
        </h3>
        <p className="text-text-muted text-[15px] md:text-[17px] max-w-[420px] transition-colors duration-300">
          {t("submissions.closed.description")}
        </p>
      </div>
    );
  }

  if (!activeTaskId) {
    return (
      <div className="py-20 text-center flex flex-col items-center animate-[fadeIn_0.5s_ease_forwards]">
        <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center border border-border mb-6 shadow-sm transition-colors duration-300">
          <UploadCloud
            className="w-9 h-9 text-text-main transition-colors duration-300"
            strokeWidth={1.5}
          />
        </div>
        <h3 className="text-[22px] md:text-[26px] font-bold text-text-main mb-2 transition-colors duration-300">
          {t("submissions.empty.no_task.title")}
        </h3>
        <p className="text-text-muted text-[15px] md:text-[17px] max-w-[420px] transition-colors duration-300">
          {t("submissions.empty.no_task.description")}
        </p>
      </div>
    );
  }

  if (!userTeamId) {
    return (
      <div className="py-20 text-center flex flex-col items-center animate-[fadeIn_0.5s_ease_forwards]">
        <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center border border-border mb-6 shadow-sm transition-colors duration-300">
          <UploadCloud
            className="w-9 h-9 text-text-main transition-colors duration-300"
            strokeWidth={1.5}
          />
        </div>
        <h3 className="text-[22px] md:text-[26px] font-bold text-text-main mb-2 transition-colors duration-300">
          {t("submissions.empty.not_participant.title")}
        </h3>
        <p className="text-text-muted text-[15px] md:text-[17px] max-w-[420px] transition-colors duration-300">
          {t("submissions.empty.not_participant.description")}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] max-w-2xl mx-auto py-4 md:py-10">
      <div className="flex flex-col gap-10">
        <div>
          <h3 className="text-3xl md:text-4xl font-black text-text-main mb-4 font-quicksand tracking-tight transition-colors duration-300">
            {t("submissions.form.title")}
          </h3>
          <p className="text-text-muted text-[15px] md:text-[17px] leading-relaxed transition-colors duration-300">
            {t("submissions.form.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <div className="group">
            <label className="block text-[13px] font-bold text-text-muted/80 uppercase tracking-widest mb-4 transition-colors duration-300">
              {t("submissions.form.link_label")}
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 transition-colors duration-300 group-focus-within:text-primary" />
              <input
                type="url"
                value={submissionLink}
                onChange={(e) => {
                  setSubmissionLink(e.target.value);
                  if (isSuccess) setIsSuccess(false);
                }}
                disabled={submitTask.isPending}
                placeholder="https://github.com/..."
                className="w-full pl-14 pr-6 py-5 bg-bg-body border-2 border-border/60 rounded-[20px] outline-none focus:border-primary focus:bg-transparent transition-all duration-300 text-text-main font-medium text-[16px] placeholder:text-text-muted/40 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!submissionLink.trim() || submitTask.isPending}
            className="w-full py-5 bg-primary text-white rounded-[20px] font-bold text-[16px] flex items-center justify-center gap-3 hover:shadow-[0_15px_30px_rgba(var(--color-primary),0.3)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
          >
            {submitTask.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {submitTask.isPending
              ? t("submissions.form.button_sending")
              : isSuccess
                ? t("submissions.form.button_success")
                : t("submissions.form.submit_button")}
          </button>
        </div>
      </div>
    </div>
  );
};
