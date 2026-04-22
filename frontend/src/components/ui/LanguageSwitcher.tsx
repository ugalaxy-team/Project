import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const LANGUAGES = [
  { code: "uk", label: "UK", flag: "🇺🇦", title: "Українська" },
  { code: "en", label: "EN", flag: "🇬🇧", title: "English" },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div
      role="group"
      aria-label="Вибір мови"
      // Фон-трек у стилі сторінки авторизації (сірий у світлій темі, темний у темній)
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
              "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold tracking-wide transition-colors duration-300 select-none border-0 bg-transparent cursor-pointer z-10",
              // Текст змінюється як у табах авторизації
              isActive
                ? "text-text-main"
                : "text-text-muted hover:text-text-main",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeLangBg"
                // Плаваюча плашка бере колір карток системи
                className="absolute inset-0 bg-bg-card rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-20 leading-none">{lang.flag}</span>
            <span className="relative z-20">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
};
