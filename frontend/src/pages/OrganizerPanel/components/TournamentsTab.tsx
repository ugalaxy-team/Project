import { useMemo } from "react";
import { type Tournament } from "./types";
import { TournamentFilters } from "./TournamentFilters";
import { TournamentTable } from "./TournamentTable";

interface TournamentsTabProps {
  tournaments: Tournament[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onInfo: (tournament: Tournament) => void;
  onEdit: (tournament: Tournament) => void;
  onDelete: (id: number) => void;
  onCreateClick: () => void;
}

const TournamentsTab = ({
  tournaments,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onInfo,
  onEdit,
  onDelete,
  onCreateClick,
}: TournamentsTabProps) => {
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t: Tournament) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toString().includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" || t.status?.name === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tournaments, searchQuery, statusFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic">
            Управління списком
          </h2>
          <p className="text-slate-400 text-sm">
            Всього: {filteredTournaments.length}
          </p>
        </div>
        <button
          className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-8 py-3.5 rounded-xl text-sm font-black transition-all shadow-lg uppercase"
          onClick={onCreateClick}
        >
          + Створити турнір
        </button>
      </div>

      <TournamentFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <TournamentTable
        tournaments={filteredTournaments}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onInfo={onInfo}
        onEdit={onEdit}
        onDelete={onDelete}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
};

export { TournamentsTab };
