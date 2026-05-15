import { useMemo, useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";

import apiClient from "@/api/client";
import {
  TournamentHeader,
  TournamentMainContent,
  TournamentLoadingState,
  TournamentErrorState,
  RegistrationBanner,
} from "./components";
import { getDeadlineInfo } from "./utils";
import type { TournamentData } from "./types";

export const TournamentPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("tournament");
  const currentUser = useSelector((state: RootState) => state.user.user);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    data: tournament,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      if (!id) throw new Error("Tournament ID is missing");
      const response = await apiClient.get<TournamentData | TournamentData[]>(
        `/tournaments/${id}/`,
      );
      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      if (!data) throw new Error("Tournament not found");
      return data;
    },
    enabled: !!id,
    retry: 1,
  });

  const { currentStatus, deadlineValue, deadlineLabel } = useMemo(
    () => getDeadlineInfo(tournament || null, t),
    [tournament, t, tick],
  );

  if (isLoading || currentUser === undefined) {
    return <TournamentLoadingState />;
  }

  if (error || !tournament) {
    return <TournamentErrorState />;
  }

  const rawStatus = tournament.status?.name || tournament.status_name;
  const isDraft = String(rawStatus).toLowerCase() === "draft";
  const isOrganizer = Boolean(
    currentUser &&
    (tournament.creator?.firebase_uid === currentUser.uid ||
      tournament.creator?.id === (currentUser as any).id),
  );

  if (isDraft && !isOrganizer) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-body font-inter text-text-main flex flex-col selection:bg-primary/30 transition-colors duration-500">
      <TournamentHeader
        tournament={tournament}
        currentStatus={currentStatus}
        deadlineValue={deadlineValue}
        deadlineLabel={deadlineLabel}
      />

      <RegistrationBanner tournamentId={tournament.id} status={currentStatus} />

      <TournamentMainContent tournament={tournament} />
    </div>
  );
};
