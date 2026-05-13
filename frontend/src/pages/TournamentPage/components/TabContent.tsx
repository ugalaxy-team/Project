import { DescriptionTab } from "./tabs/DescriptionTab";
import { TeamsTab } from "./tabs/TeamsTab";
import type { TabId, TournamentData } from "../types";
import { TaskDescriptionTab } from "./tabs/TaskDescriptionTab";
import { CalendarTab } from "./tabs/CalendarTab";

interface TabContentProps {
  activeTab: TabId;
  tournament: TournamentData;
}

export const TabContent = ({ activeTab, tournament }: TabContentProps) => {
  return (
    <div className="bg-bg-card rounded-[32px] p-6 md:p-[60px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-slate-100 min-h-[400px] transition-all">
      {activeTab === "desc" && (
        <DescriptionTab
          description={tournament.description}
          tasks={tournament.tasks}
          activeTask={tournament.active_task}
        />
      )}
      {activeTab === "task_desc" && (
        <TaskDescriptionTab
          tasks={tournament.tasks}
          activeTask={tournament.active_task}/>
      )}
      {activeTab === "teams" && <TeamsTab teams={tournament.teams} />}
      {activeTab === "calendar" && <CalendarTab tournamentData={tournament} />}
    </div>
  );
};