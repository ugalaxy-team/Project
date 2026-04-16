// LanguageSwitcher.tsx
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: "uk", label: "UK", flag: "🇺🇦", title: "Українська" },
    { code: "en", label: "EN", flag: "🇬🇧", title: "English" },
  ];

  return (
    <div
      role="group"
      aria-label="Вибір мови"
      className="flex items-center bg-white/10 p-[3px] rounded-full border border-white/10 gap-0.5"
    >
      {languages.map((lang) => {
        const isActive = i18n.resolvedLanguage === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            title={lang.title}
            aria-pressed={isActive}
            aria-label={lang.title}
            className={`relative flex items-center gap-[5px] px-2.5 py-[5px] rounded-full text-[12px] font-bold tracking-[0.05em] transition-colors duration-200 select-none border-0 bg-transparent cursor-pointer z-10
              ${isActive ? "text-[#6A66FF]" : "text-white/60 hover:text-white/90"}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeLangBg"
                className="absolute inset-0 bg-white rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-20 text-[13px] leading-none">
              {lang.flag}
            </span>
            <span className="relative z-20">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
};
