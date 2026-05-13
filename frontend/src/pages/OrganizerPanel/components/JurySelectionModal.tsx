import { type Tournament, type User } from "./types";

interface JurySelectionModalProps {
  isOpen: boolean;
  selectedTournament: Tournament | null;
  allUsers: User[];
  addedJurors: number[];
  onToggleJuror: (userId: number) => void;
  onClose: () => void;
  onSave: () => void;
}

const JurySelectionModal = ({
  isOpen,
  selectedTournament,
  allUsers = [],
  addedJurors = [],
  onToggleJuror,
  onClose,
  onSave,
}: JurySelectionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 antialiased">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }} 
      />
      
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Вибір журі</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Турнір: <span className="font-semibold text-indigo-600">{selectedTournament?.title}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {allUsers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">Користувачів не знайдено</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allUsers.map((user) => {
                const isSelected = addedJurors.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onToggleJuror(user.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                      isSelected 
                        ? "bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200" 
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      {user.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                        {user.full_name}
                      </p>
                      <p className={`text-[11px] truncate ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                        {user.email}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      isSelected ? "bg-white text-indigo-600" : "border border-slate-200 group-hover:border-indigo-300"
                    }`}>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Обрано</p>
            <p className="text-xl font-bold text-slate-900">
              {addedJurors.length} <span className="text-sm font-medium text-slate-500">експертів</span>
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={onSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              Підтвердити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { JurySelectionModal };