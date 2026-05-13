import { useState } from "react";
import { Hero } from "@/components/Hero";
import { GameDevIcon } from "../icons";
import { STATUS_CONFIG } from "../config.tsx";
import { StatItem } from "./StatItem";
import { LookingForTeamModal } from "./LookingForTeamModal";
import type { TournamentData } from "../types";

interface TournamentHeaderProps {
  tournament: TournamentData;
  currentStatus: string;
  deadlineValue: string;
  deadlineLabel: string;
}

export const TournamentHeader = ({
  tournament,
  currentStatus,
  deadlineValue,
  deadlineLabel,
}: TournamentHeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statusInfo = STATUS_CONFIG[currentStatus];

  const teamSizeLabel = `${tournament.min_people_in_team}-${tournament.max_people_in_team}`;

  return (
    <>
      <Hero
        bgText="SLOVO JAM"
        description=""
        title={
          <div className="flex flex-col items-center w-full mt-8 animate-[fadeIn_0.6s_ease-out_forwards]">
            <div className="flex gap-3 mb-6 flex-wrap justify-center text-base normal-case tracking-normal">
              <div
                className={`px-5 py-2 rounded-full font-quicksand font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 cursor-default ${statusInfo.className}`}
              >
                {statusInfo.icon} {statusInfo.label}
              </div>
              <div className="bg-white/10 border border-white/20 text-white backdrop-blur-md px-5 py-2 rounded-full font-quicksand font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 cursor-default">
                <GameDevIcon /> GameDev & Алгоритми
              </div>
            </div>

            <h1 className="mb-8 block text-[clamp(40px,8vw,80px)] leading-[1.1] font-black text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
              {tournament.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center w-full gap-8 md:gap-12 mb-12 text-base normal-case bg-white/5 hover:bg-white/10 transition-colors px-6 md:px-12 py-8 rounded-[32px] backdrop-blur-xl border border-white/10 shadow-2xl">
              <StatItem value={deadlineValue} label={deadlineLabel} />
              <div className="hidden md:block w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent self-center"></div>
              <StatItem
                value={teamSizeLabel}
                label="Учасників у команді"
              />
              <div className="hidden md:block w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent self-center"></div>
              <StatItem value={`До ${tournament.max_teams}`} label="Максимум команд" />
            </div>

            <div className="flex gap-4 text-base font-normal normal-case tracking-normal font-quicksand relative z-30">
              <button className="btn btn-accent px-10 py-4 shadow-[0_0_30px_rgba(var(--color-accent),0.3)] hover:shadow-[0_0_40px_rgba(var(--color-accent),0.5)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 text-dark-theme font-bold rounded-xl">
                Подати заявку
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-outline px-10 py-4 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 rounded-xl border-white/30 text-white"
              >
                Шукаю команду
              </button>
            </div>
          </div>
        }
      />
      <LookingForTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
