import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { TournamentHeader } from "./components/TournamentHeader";
import { TournamentMainContent } from "./components/TournamentMainContent";
import { TournamentLoadingState } from "./components/TournamentLoadingState";
import { TournamentErrorState } from "./components/TournamentErrorState";
import { getDeadlineInfo } from "./utils";
import type { TournamentData } from "./types";

export const TournamentPage = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: tournament,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      if (!id) throw new Error("ID турніру не знайдено");
      const response = await apiClient.get<TournamentData>(
        `/tournaments/${id}`,
      );
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });

  const { currentStatus, deadlineValue, deadlineLabel } = useMemo(
    () => getDeadlineInfo(tournament || null),
    [tournament],
  );

  if (isLoading) {
    return <TournamentLoadingState />;
  }

  if (error || !tournament) {
    return (
      <TournamentErrorState
        error={error as Error | null}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-body font-inter text-dark-theme flex flex-col selection:bg-accent/30">
      <TournamentHeader
        tournament={tournament}
        currentStatus={currentStatus}
        deadlineValue={deadlineValue}
        deadlineLabel={deadlineLabel}
      />
      <TournamentMainContent tournament={tournament} />
    </div>
  );
};
