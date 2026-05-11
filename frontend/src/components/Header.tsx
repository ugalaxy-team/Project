import { useState, useEffect, useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { LanguageSwitcher } from "./ui/LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "../utils/cn";

const NAV_ITEMS = [
  { path: "/tournaments", key: "nav.tournaments" },
  { path: "/about-us", key: "nav.about" },
  { path: "/support", key: "nav.support" },
  { path: "/contact", key: "nav.contact" },
  { path: "/news", key: "nav.news" }, // Додано новий маршрут з гілки dev
];

const SOLID_BG_ROUTES = ["/profile", "/role-request-form"];

export const Header = () => {
  const { t } = useTranslation("common");
  const { pathname } = useLocation();
  const user = useSelector((state: RootState) => state.user.user);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAlwaysSolid = useMemo(() => {
    return (
      SOLID_BG_ROUTES.includes(pathname) || pathname.startsWith("/tournament/")
    );
  }, [pathname]);

  const showSolidBg = isScrolled || isAlwaysSolid;

  return (
    <div
      className={cn(
        "w-full fixed top-0 left-0 z-50 transition-all duration-500 border-b",
        showSolidBg
          ? "bg-header-bg backdrop-blur-md shadow-lg py-2 border-white/10 dark:border-white/5"
          : "bg-transparent py-3 md:py-4 border-transparent",
      )}
    >
      <header className="max-w-[1320px] mx-auto flex justify-between items-center px-5">
        <Link
          to="/"
          className="font-quicksand text-[22px] md:text-[28px] font-extrabold text-white no-underline flex items-center gap-1.5 hover:opacity-90 transition-opacity duration-300"
        >
          UGalaxy
          <span className="text-accent opacity-90 px-0.5">×</span>
          Star for Life
        </Link>

        <nav className="hidden lg:flex items-center gap-7 xl:gap-10 relative">
          {NAV_ITEMS.map(({ path, key }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "group relative font-bold text-[15px] tracking-wide py-2 transition-colors duration-300",
                  isActive ? "text-white" : "text-white/70 hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{t(key)}</span>

                  {isActive ? (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  ) : (
                    <span className="absolute bottom-0 left-1/2 h-[3px] bg-accent/40 rounded-full transition-all duration-300 ease-out -translate-x-1/2 w-0 opacity-0 group-hover:w-full group-hover:opacity-100" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          {user?.uid ? (
            <div className="flex items-center gap-3">
              <NotificationsDropdown />
              <div className="hidden lg:block">
                {/* Додано userRoles з гілки dev */}
                <ProfileDropdown userRoles={user?.roles || []} />
              </div>
            </div>
          ) : (
            <motion.div
              className="hidden sm:block"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/auth"
                className="relative flex items-center justify-center h-[42px] px-7 font-quicksand font-bold text-[15px] rounded-full transition-all duration-300 bg-bg-card text-text-main shadow-sm border border-transparent hover:bg-accent hover:text-slate-900 hover:shadow-lg hover:shadow-accent/20 dark:border-white/5"
              >
                {t("auth.login")}
              </Link>
            </motion.div>
          )}

          <button
            className="lg:hidden text-white p-1.5 focus:outline-none hover:text-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-full left-0 w-full bg-header-bg backdrop-blur-xl border-t border-white/10 shadow-2xl overflow-hidden origin-top"
          >
            <div className="flex flex-col px-6 py-8 gap-6">
              {NAV_ITEMS.map(({ path, key }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block font-bold text-[18px] transition-all duration-300",
                      isActive
                        ? "text-accent translate-x-2"
                        : "text-white/80 hover:text-white hover:translate-x-2",
                    )
                  }
                >
                  {t(key)}
                </NavLink>
              ))}

              <div className="flex items-center justify-between mt-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>

                {user?.uid ? (
                  <div onClick={() => setIsMobileMenuOpen(false)}>
                    {/* Додано userRoles та isMobile з гілки dev */}
                    <ProfileDropdown
                      userRoles={user?.roles || []}
                      isMobile={true}
                    />
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center font-quicksand font-bold rounded-full py-3 px-8 text-[15px] bg-bg-card text-text-main shadow-md active:scale-95 transition-all"
                  >
                    {t("auth.login")}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
