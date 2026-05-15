import { useTranslation } from "react-i18next";
import { Hero } from "@/components/Hero";
import { StatItem } from "./StatItem";
import { STATUS_CONFIG } from "../config";
import type { TournamentData } from "../types";
import { Hash } from "lucide-react";

interface TournamentHeaderProps {
  tournament: TournamentData;
  currentStatus: string;
  deadlineValue: string | null;
  deadlineLabel: string | null;
}

export const TournamentHeader = ({
  tournament,
  currentStatus,
  deadlineValue,
  deadlineLabel,
}: TournamentHeaderProps) => {
  const { t } = useTranslation("tournament");

  const statusInfo = STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG];
  const bgLabel = statusInfo?.label || "SLOVO";

  return (
    <Hero
      bgText={bgLabel.toUpperCase()}
      title={
        <div className="flex flex-col items-center w-full mt-10 animate-[fadeIn_0.6s_ease-out]">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tournament.tags?.map((tag: any) => (
              <div
                key={tag.id}
                className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[11px] font-bold uppercase tracking-[0.15em] backdrop-blur-md"
              >
                <Hash className="w-3 h-3 inline-block mr-1 opacity-50" />
                {tag.name}
              </div>
            ))}
          </div>

          <h1 className="mb-10 text-[clamp(42px,9vw,84px)] leading-[0.9] font-black text-center text-white uppercase tracking-tighter drop-shadow-2xl transition-all">
            {tournament.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20 bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
            {deadlineValue && (
              <StatItem value={deadlineValue} label={deadlineLabel || ""} />
            )}
            <div className="hidden md:block w-[1px] h-12 bg-white/10" />
            <StatItem
              value={`${tournament.min_people_in_team}-${tournament.max_people_in_team}`}
              label={t("header.stats.team_size")}
            />
            <div className="hidden md:block w-[1px] h-12 bg-white/10" />
            <StatItem
              value={tournament.max_teams.toString()}
              label={t("header.stats.max_teams")}
            />
          </div>
        </div>
      }
    />
  );
};
