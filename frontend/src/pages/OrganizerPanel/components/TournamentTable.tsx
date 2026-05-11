import { type Tournament, type TournamentStatus } from "./types";
import { tournamentStatuses } from "@/config/appConfig";

const [draftStatus, registrationStatus, runningStatus, finishedStatus] =
  tournamentStatuses;

interface TournamentTableProps {
  tournaments: Tournament[];
  searchQuery: string;
  statusFilter: string;
  onInfo: (tournament: Tournament) => void;
  onEdit: (tournament: Tournament) => void;
  onDelete: (id: number) => void;
  onClearFilters: () => void;
}

const TournamentTable = ({
  tournaments,
  searchQuery,
  statusFilter,
  onInfo,
  onEdit,
  onDelete,
  onClearFilters,
}: TournamentTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case registrationStatus.name:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case runningStatus.name:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case finishedStatus.name:
        return "bg-slate-200 text-slate-700 border-slate-300";
      case draftStatus.name:
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (tournaments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-black text-slate-800 mb-2 text-center">
          Нічого не знайдено
        </h3>
        <p className="text-slate-500 text-center max-w-md mb-6">
          {searchQuery || statusFilter !== "all"
            ? `На жаль, турнірів за запитом "${searchQuery || "вибраний статус"}" не знайдено. Спробуй змінити параметри пошуку.`
            : "Тут поки що немає турнірів. Створи перший турнір, щоб почати!"}
        </p>
        <button
          onClick={onClearFilters}
          className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-sm transition-colors"
        >
          Очистити фільтри
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-6">
            <th className="pb-2 pl-6">ID</th>
            <th className="pb-2">Назва</th>
            <th className="pb-2">Статус</th>
            <th className="pb-2 text-right pr-6">Керування</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map((t) => (
            <tr
              key={t.id}
              className="bg-white border border-gray-100 shadow-sm group hover:shadow-md transition-all"
            >
              <td className="py-5 pl-6 rounded-l-2xl text-slate-400 font-bold">
                #{t.id}
              </td>
              <td className="py-5 font-black text-slate-800 uppercase text-sm">
                {t.title}
              </td>
              <td className="py-5">
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(t.status?.name || t.status_name)}`}
                >
                  {t.status?.display_name || t.status_name}
                </span>
              </td>
              <td className="py-5 pr-6 rounded-r-2xl text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onInfo(t)}
                    className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(t)}
                    className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-all"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-all"
                  >
                    Видалити
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { TournamentTable };
