import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Loader2, AlertTriangle } from "lucide-react";
import { getTournamentLeaderboard } from "../../../../api/requests/getTournamentLeaderboard";

interface LeaderboardTabProps {
  tournamentId: number;
}

export const LeaderboardTab = ({ tournamentId }: LeaderboardTabProps) => {
  const { t } = useTranslation("tournament");

  const {
    data: leaderboard,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tournamentLeaderboard", tournamentId],
    queryFn: () => getTournamentLeaderboard(tournamentId),
    enabled: !!tournamentId,
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center animate-[fadeIn_0.5s_ease_forwards]">
        <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center border border-border mb-6 shadow-sm transition-colors duration-300">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <h3 className="text-[22px] md:text-[26px] font-bold text-text-main mb-2 transition-colors duration-300">
          {t("leaderboard.loading")}
        </h3>
        <p className="text-text-muted text-[15px] md:text-[17px] max-w-[420px] transition-colors duration-300">
          Зачекайте хвилинку, збираємо дані турніру.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center flex flex-col items-center animate-[fadeIn_0.5s_ease_forwards]">
        <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center border border-border mb-6 shadow-sm transition-colors duration-300">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-[22px] md:text-[26px] font-bold text-text-main mb-2 transition-colors duration-300">
          {t("leaderboard.error.title")}
        </h3>
        <p className="text-text-muted text-[15px] md:text-[17px] max-w-[420px] transition-colors duration-300">
          {t("leaderboard.error.desc")}
        </p>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center animate-[fadeIn_0.5s_ease_forwards]">
        <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center border border-border mb-6 shadow-sm transition-colors duration-300">
          <Trophy className="w-8 h-8 text-text-main transition-colors duration-300" />
        </div>
        <h3 className="text-[22px] md:text-[26px] font-bold text-text-main mb-2 transition-colors duration-300">
          {t("leaderboard.empty.title")}
        </h3>
        <p className="text-text-muted text-[15px] md:text-[17px] max-w-[420px] transition-colors duration-300">
          {t("leaderboard.empty.desc")}
        </p>
      </div>
    );
  }

  const sortedTeams = [...leaderboard].sort(
    (a, b) => b.total_score - a.total_score,
  );

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] flex flex-col gap-6">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-3 min-w-[500px]">
          <thead>
            <tr className="text-text-muted text-[12px] md:text-[13px] uppercase tracking-widest font-bold">
              <th className="px-4 md:px-6 py-2">
                {t("leaderboard.columns.rank")}
              </th>
              <th className="px-4 md:px-6 py-2">
                {t("leaderboard.columns.team")}
              </th>
              <th className="px-4 md:px-6 py-2 text-right">
                {t("leaderboard.columns.score")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => {
              const rank = index + 1;
              return (
                <tr
                  key={team.submission_id}
                  className="bg-bg-body border border-border rounded-2xl group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                >
                  <td className="px-4 md:px-6 py-4 rounded-l-2xl w-[80px]">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg bg-bg-card border border-border transition-colors duration-300">
                      {rank === 1 ? (
                        <Trophy className="text-amber-500 w-5 h-5 md:w-6 md:h-6" />
                      ) : rank === 2 ? (
                        <Medal className="text-slate-400 w-5 h-5 md:w-6 md:h-6" />
                      ) : rank === 3 ? (
                        <Medal className="text-orange-500 w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <span className="text-text-muted">{rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="font-bold text-text-main text-[16px] md:text-[17px] transition-colors duration-300">
                      {team.team_name}
                    </div>
                    {team.submitted_reviews > 0 && (
                      <div className="text-text-muted text-[12px] md:text-[13px] mt-0.5 transition-colors duration-300">
                        {t("leaderboard.reviews")} {team.submitted_reviews}
                      </div>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right rounded-r-2xl">
                    <div className="flex flex-col items-end">
                      <span className="text-primary font-black text-xl md:text-2xl tracking-tight leading-none">
                        {team.total_score}
                      </span>
                      {team.average_score > 0 && (
                        <span className="text-text-muted font-semibold text-[11px] md:text-[12px] mt-1">
                          {t("leaderboard.avg")} {team.average_score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
