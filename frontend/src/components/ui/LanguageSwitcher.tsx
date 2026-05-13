import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const LANGUAGES = [
  { code: "uk", label: "UK", title: "Українська" },
  { code: "en", label: "EN", title: "English" },
];

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation("common");

  return (
    <div
      role="group"
      aria-label={t("language_switcher.aria_label")}
      className="flex items-center bg-border/60 p-1 rounded-full transition-colors duration-300"
    >
      {LANGUAGES.map((lang) => {
        const isActive = i18n.resolvedLanguage === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            title={lang.title}
            aria-pressed={isActive}
            aria-label={lang.title}
            className={cn(
              "relative flex items-center justify-center min-w-[54px] h-[34px] rounded-full text-[15px] font-bold tracking-wide transition-colors duration-300 select-none border-0 bg-transparent cursor-pointer z-10",
              isActive
                ? "text-text-main"
                : "text-text-muted hover:text-text-main",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeLangBg"
                className="absolute inset-0 bg-bg-card rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-20 leading-none pt-[1px]">
              {lang.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
