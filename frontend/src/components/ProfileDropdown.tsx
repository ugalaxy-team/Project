import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { auth } from "../firebase";
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import { useClickOutside } from "../hooks/useClickOutside";
import { cn } from "../utils/cn";

export const ProfileDropdown = () => {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleMenu}
        aria-expanded={isOpen}
        className="py-1.5 pl-1.5 pr-4 text-base flex items-center gap-2.5 rounded-full transition-all hover:shadow-md bg-white/10 border border-white/20 hover:bg-white/20"
      >
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

        <span className="font-semibold text-white max-w-[120px] truncate hidden sm:block">
          {displayName}
        </span>

        <svg
          className={cn(
            "w-4 h-4 text-white transition-transform duration-300",
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
        <div className="absolute right-0 mt-3 w-56 bg-bg-card rounded-xl shadow-xl py-2 flex flex-col border border-border overflow-hidden z-50 transition-colors duration-300">
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

          <hr className="border-border my-1 mx-3 transition-colors duration-300" />

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
