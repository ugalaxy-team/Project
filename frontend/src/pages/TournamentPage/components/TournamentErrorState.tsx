import { AlertIcon } from "../icons";

interface TournamentErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export const TournamentErrorState = ({
  error,
  onRetry,
}: TournamentErrorStateProps) => {
  const errorMessage =
    (error as any)?.response?.data?.detail?.[0]?.msg ||
    (error as any)?.response?.data?.message ||
    (error as Error)?.message ||
    "Не вдалося завантажити інформацію про турнір.";

  return (
    <div className="min-h-[70vh] bg-bg-body flex items-center justify-center p-5">
      <div className="max-w-md w-full bg-white border border-red-100 rounded-[32px] p-8 md:p-10 flex flex-col items-center text-center shadow-[0_20px_50px_-10px_rgba(239,68,68,0.15)] animate-[fadeIn_0.4s_ease_forwards]">
        <div className="text-red-500 bg-red-50 p-5 rounded-full mb-6 shadow-inner">
          <AlertIcon />
        </div>
        <h2 className="text-2xl md:text-3xl font-quicksand font-black text-slate-800 mb-4">
          Ой, халепа!
        </h2>
        <p className="text-slate-600 text-[17px] mb-3 font-medium leading-relaxed">
          Проблемки. Турнір трохи загубився в мережі або щось пішло не так.
          Але не хвилюйтесь, ми вже намагаємося його знайти!
        </p>
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 mb-8 w-full">
          <p className="text-sm text-red-400 font-mono truncate">
            {errorMessage}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="w-full sm:w-auto px-8 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:-translate-y-1"
        >
          Спробувати знову
        </button>
      </div>
    </div>
  );
};
