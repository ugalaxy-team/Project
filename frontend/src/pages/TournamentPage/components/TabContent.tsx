import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  DescriptionTab,
  TaskDescriptionTab,
  TeamsTab,
  CalendarTab,
  LeaderboardTab,
  SubmissionsTab,
} from "./tabs";
import type { TabId, TournamentData } from "../types";

interface TabContentProps {
  activeTab: TabId;
  tournament: TournamentData;
}

export const TabContent = ({ activeTab, tournament }: TabContentProps) => {
  const currentUser = useSelector((state: RootState) => state.user.user);

  const userTeam = tournament.teams?.find((team) =>
    team.members?.some((member) => member.email === currentUser?.email),
  );

  const TAB_COMPONENTS: Record<TabId, JSX.Element> = {
    desc: (
      <DescriptionTab
        description={tournament.description}
        tasks={tournament.tasks}
        activeTask={tournament.active_task}
      />
    ),
    task_desc: (
      <TaskDescriptionTab
        tasks={tournament.tasks}
        activeTask={tournament.active_task}
      />
    ),
    teams: <TeamsTab teams={tournament.teams || []} />,
    calendar: <CalendarTab tournamentData={tournament} />,
    leaderboard: <LeaderboardTab tournamentId={tournament.id} />,
    submissions: (
      <SubmissionsTab
        tournament={tournament}
        activeTaskId={tournament.active_task?.id}
        userTeamId={userTeam?.id}
      />
    ),
  };

  return (
    <div className="bg-bg-card rounded-[24px] md:rounded-[32px] p-5 md:p-[60px] shadow-sm border border-border min-h-[400px] transition-colors duration-300 relative overflow-hidden">
      {TAB_COMPONENTS[activeTab]}
    </div>
  );
};
