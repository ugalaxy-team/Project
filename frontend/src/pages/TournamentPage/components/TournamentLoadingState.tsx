import { SpinnerIcon } from "../icons";

export const TournamentLoadingState = () => {
  return (
    <div className="min-h-screen bg-bg-body flex flex-col items-center justify-center font-quicksand text-white">
      <SpinnerIcon />
      <p className="mt-4 text-xl font-medium tracking-wide animate-pulse text-white/80">
        Завантаження турніру...
      </p>
    </div>
  );
};
