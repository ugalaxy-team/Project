import { useState } from "react";
import { TabNavigation } from "./TabNavigation";
import { TabContent } from "./TabContent";
import type { TournamentData, TabId } from "../types";

interface TournamentMainContentProps {
  tournament: TournamentData;
}

export const TournamentMainContent = ({
  tournament,
}: TournamentMainContentProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("desc");

  return (
    <main className="max-w-[1000px] w-full mx-auto mt-6 mb-[100px] relative z-10 px-5">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <TabContent activeTab={activeTab} tournament={tournament} />
    </main>
  );
};
