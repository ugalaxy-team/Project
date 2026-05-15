import { tournamentStatuses } from "@/config/appConfig";

interface TournamentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const TournamentFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: TournamentFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="md:col-span-2 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Пошук турніру..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6366f1] bg-slate-50/50"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-slate-900">
          🔍
        </span>
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-3.5 rounded-2xl border border-gray-200 text-sm bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
      >
        <option value="all">Усі статуси</option>
        {tournamentStatuses.map((status) => (
          <option key={status.name} value={status.name}>
            {status.display_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export { TournamentFilters };
