import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { cn } from "../../../utils/cn";

export const RegistrationBanner = ({
  tournamentId,
  status,
}: {
  tournamentId: number;
  status: string;
}) => {
  const { t } = useTranslation("tournament");
  const navigate = useNavigate();

  if (status !== "registration") return null;

  return (
    <div className="max-w-[1000px] mx-auto px-5 -mt-6 md:-mt-10 relative z-40 w-full">
      <div
        className={cn(
          "relative overflow-hidden rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-8 md:px-10 md:py-10 transition-all duration-500",
          "bg-gradient-to-br from-hero-from to-hero-to border border-white/5",
        )}
      >
        <Trophy className="absolute -right-6 -bottom-10 w-48 h-48 text-white/5 -rotate-12 pointer-events-none" />

        <div className="relative z-20 text-center md:text-left flex flex-col gap-2">
          <h3 className="text-white text-2xl md:text-3xl font-nunito font-extrabold tracking-tight leading-none uppercase">
            {t("registration_banner.title")}
          </h3>
          <p className="text-white/80 font-inter font-medium text-[15px] md:text-[17px] max-w-[400px]">
            {t("registration_banner.subtitle")}
          </p>
        </div>

        <button
          onClick={() => navigate(`/tournament/${tournamentId}/register`)}
          className={cn(
            "relative z-20 px-10 py-4 rounded-2xl font-nunito font-extrabold uppercase tracking-wider text-sm md:text-base",
            "bg-white text-hero-from transition-all duration-300 ease-out",
            "hover:scale-[1.05] hover:bg-white/95",
          )}
        >
          {t("header.buttons.apply")}
        </button>
      </div>
    </div>
  );
};
