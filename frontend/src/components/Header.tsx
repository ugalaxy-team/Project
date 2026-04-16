import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { LanguageSwitcher } from "./ui/LanguageSwitcher";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation("common");
  const user = useSelector((s: RootState) => s.user.user);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/tournaments", label: t("nav.tournaments", "Турніри") },
    { path: "/about-us", label: t("nav.about", "Про нас") },
    { path: "/support", label: t("nav.support", "Підтримати") },
    { path: "/contact", label: t("nav.contact", "Контакти") },
  ];

  return (
    <div
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#6A66FF]/90 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent py-4 md:py-6"
      }`}
    >
      <header className="max-w-[1320px] mx-auto flex justify-between items-center px-5">
        <Link
          to="/"
          className="font-quicksand text-[24px] md:text-[32px] font-extrabold text-white no-underline flex items-center gap-2 hover:opacity-90 transition-opacity duration-300"
        >
          UGalaxy{" "}
          <span className="text-[#fbbf24] text-lg md:text-2xl opacity-90 px-1">
            x
          </span>{" "}
          Star for Life
        </Link>

        <nav className="hidden lg:flex items-center gap-8 xl:gap-12 relative">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative font-semibold text-[16px] tracking-wide py-2 transition-colors duration-300 ${
                  isActive ? "text-white" : "text-white/80 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{item.label}</span>
                  {isActive ? (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#fbbf24] rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  ) : (
                    <span className="absolute -bottom-1 left-1/2 h-[3px] bg-[#fbbf24]/50 rounded-full transition-all duration-300 ease-out -translate-x-1/2 w-0 opacity-0 group-hover:w-full group-hover:opacity-100"></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5 md:gap-7">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {user?.uid ? (
            <div className="flex items-center gap-3 md:gap-4">
              <NotificationsDropdown />
              <div className="hidden lg:block">
                <ProfileDropdown />
              </div>
            </div>
          ) : (
            <motion.div
              className="hidden sm:block"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/auth"
                className="relative flex items-center justify-center font-quicksand font-bold rounded-full transition-all duration-200 py-3.5 px-6 text-[15px] bg-white text-[#6A66FF] shadow-sm hover:bg-[#fbbf24] hover:text-slate-900"
              >
                {t("auth.login", "Увійти")}
              </Link>
            </motion.div>
          )}

          <button
            className="lg:hidden text-white p-2 -mr-2 focus:outline-none hover:text-[#fbbf24] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden absolute top-full left-0 w-full bg-[#6A66FF]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl overflow-hidden origin-top"
          >
            <div className="flex flex-col px-5 py-6 gap-5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block font-semibold text-[18px] transition-all duration-300 ${
                      isActive
                        ? "text-[#fbbf24] translate-x-2"
                        : "text-white/90 hover:text-white hover:translate-x-2"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="flex items-center justify-between mt-4 pt-5 border-t border-white/10">
                <LanguageSwitcher />

                {user?.uid ? (
                  <ProfileDropdown />
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to="/auth"
                      className="relative flex items-center justify-center font-quicksand font-bold rounded-full transition-all duration-200 py-3.5 px-6 text-[15px] bg-white text-[#6A66FF] shadow-sm hover:bg-[#fbbf24] hover:text-slate-900"
                    >
                      {t("auth.login", "Увійти")}
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
