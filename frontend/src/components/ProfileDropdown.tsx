import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { auth } from "../firebase";
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import { useClickOutside } from "../hooks/useClickOutside";
import { cn } from "../utils/cn";

// Імпорт з гілки dev (залишаємо їхній шлях)
import { roleByName } from "@/config/appConfig";

interface ProfileDropdownProps {
  userRoles?: any[];
  isMobile?: boolean;
}

export const ProfileDropdown = ({
  userRoles = [],
  isMobile = false,
}: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("common");

  const fbUser = auth.currentUser;
  const reduxUser = useSelector((s: RootState) => s.user.user);

  const photoURL = fbUser?.photoURL;
  const displayName =
    fbUser?.displayName || reduxUser?.full_name || "Користувач";
  const initial = displayName.charAt(0).toUpperCase();

  useClickOutside(dropdownRef, () => setIsOpen(false));
  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Логіка перевірки ролей з гілки dev
  const hasRole = (targetRole: string) => {
    if (!Array.isArray(userRoles)) return false;

    return userRoles.some((role) => {
      if (typeof role === "string") {
        return role.toLowerCase() === targetRole.toLowerCase();
      }
      if (typeof role === "object" && role !== null && role.name) {
        return role.name.toLowerCase() === targetRole.toLowerCase();
      }
      return false;
    });
  };

  const isAdmin = hasRole(roleByName?.admin?.name || "admin");
  const isOrganizer = hasRole(roleByName?.organizer?.name || "organizer");
  const isJury = reduxUser?.is_jury;

  // Динамічні класи для мобільної/десктопної версії
  const wrapperClass = isMobile ? "w-full" : "relative";

  const buttonClass = isMobile
    ? "flex items-center gap-3 font-semibold text-[18px] py-2 text-white hover:text-accent transition-colors w-full"
    : "py-1.5 pl-1.5 pr-4 text-base flex items-center gap-2.5 rounded-full transition-all hover:shadow-md bg-white/10 border border-white/20 hover:bg-white/20";

  const menuContainerClass = isMobile
    ? "w-full bg-bg-card rounded-xl shadow-md py-2 flex flex-col mt-2 border border-border overflow-hidden transition-colors duration-300"
    : "absolute right-0 mt-3 w-64 bg-bg-card rounded-xl shadow-xl py-2 flex flex-col border border-border overflow-hidden z-50 transition-colors duration-300";

  return (
    <div className={wrapperClass} ref={dropdownRef}>
      <button
        onClick={toggleMenu}
        aria-expanded={isOpen}
        className={buttonClass}
      >
        {/* Аватарка (залишаємо твій гарний дизайн) */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white shrink-0 shadow-sm border-2 border-white/20">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="font-bold text-sm">{initial}</span>
          )}
        </div>

        {/* Ім'я користувача */}
        <span
          className={cn(
            "font-semibold text-white truncate max-w-[120px]",
            isMobile ? "block" : "hidden sm:block",
          )}
        >
          {displayName}
        </span>

        {/* Стрілочка */}
        <svg
          className={cn(
            "w-4 h-4 text-white transition-transform duration-300 ml-auto sm:ml-0",
            isOpen && "rotate-180",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={menuContainerClass}>
          {/* Стандартний профіль */}
          <Link
            to="/profile"
            onClick={closeMenu}
            className="px-5 py-3 text-text-main font-semibold hover:bg-bg-body hover:text-primary transition-colors flex items-center gap-3 group"
          >
            <svg
              className="w-5 h-5 text-text-muted transition-colors group-hover:text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {t("profile_dropdown.my_profile")}
          </Link>

          {/* Панель організатора (з dev) */}
          {isOrganizer && (
            <Link
              to="/organizer-panel"
              onClick={closeMenu}
              className="px-5 py-3 text-text-main font-semibold hover:bg-bg-body hover:text-accent transition-colors flex items-center gap-3 group"
            >
              <svg
                className="w-5 h-5 text-text-muted transition-colors group-hover:text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Панель організатора
            </Link>
          )}

          {/* Панель журі (з dev) */}
          {isJury && (
            <Link
              to="/jury-panel"
              onClick={closeMenu}
              className="px-5 py-3 text-text-main font-semibold hover:bg-bg-body hover:text-accent transition-colors flex items-center gap-3 group"
            >
              <svg
                className="w-5 h-5 text-text-muted transition-colors group-hover:text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Панель журі
            </Link>
          )}

          {/* Адмін-панель (з dev) */}
          {isAdmin && (
            <a
              href={`${import.meta.env.VITE_BACKEND_URL}/admin/`}
              onClick={closeMenu}
              className="px-5 py-3 text-text-main font-semibold hover:bg-bg-body hover:text-pink-accent transition-colors flex items-center gap-3 group"
            >
              <svg
                className="w-5 h-5 text-text-muted transition-colors group-hover:text-pink-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Адмін-панель
            </a>
          )}

          <hr className="border-border my-1 mx-3 transition-colors duration-300" />

          {/* Вихід */}
          <Link
            to="/auth/sign-out"
            onClick={closeMenu}
            className="px-5 py-3 text-red-500 font-semibold hover:bg-red-500/10 transition-colors flex items-center gap-3 group"
          >
            <svg
              className="w-5 h-5 text-red-500 transition-transform group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t("profile_dropdown.logout")}
          </Link>
        </div>
      )}
    </div>
  );
};
