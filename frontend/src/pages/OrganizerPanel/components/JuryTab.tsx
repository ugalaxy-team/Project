import { type Tournament } from "./types";

interface JuryTabProps {
  tournaments: Tournament[];
  onJuryClick: (tournament: Tournament) => void;
  onSwitchTab: () => void;
}

const JuryTab = ({
  tournaments,
  onJuryClick,
  onSwitchTab,
}: JuryTabProps) => {
  if (tournaments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-2xl font-black text-slate-800 mb-2 text-center">
          Турнірів ще немає
        </h3>
        <p className="text-slate-500 text-center max-w-md mb-6">
          Спочатку створи турнір, а потім зможеш керувати журі та
          додавати експертів для оцінювання.
        </p>
        <button
          onClick={onSwitchTab}
          className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-sm transition-colors"
        >
          Перейти до турнірів
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 italic uppercase">
          Призначення експертів
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournaments.map((t: Tournament) => (
          <div
            key={t.id}
            className="group border border-slate-100 rounded-[2rem] p-6 flex justify-between items-center bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all cursor-pointer"
            onClick={() => onJuryClick(t)}
          >
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight group-hover:text-[#6366f1] transition-colors">
                {t.title}
              </h3>
              <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold">
                ID: {t.id}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#6366f1] text-white flex items-center justify-center group-hover:scale-110 transition-all shadow-md font-bold text-xl">
              +
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { JuryTab };
