import { useTranslation } from "react-i18next";
import { SpinnerIcon } from "../icons";

export const TournamentLoadingState = () => {
  const { t } = useTranslation("tournament");

  return (
    <div className="min-h-screen bg-bg-body flex flex-col items-center justify-center font-quicksand text-text-main transition-colors duration-300">
      <SpinnerIcon className="text-primary" />
      <p className="mt-4 text-[18px] md:text-xl font-medium tracking-wide animate-pulse text-text-muted">
        {t("loading", "Завантаження турніру...")}
      </p>
    </div>
  );
};
