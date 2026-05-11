import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { auth } from "../firebase";
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import { useClickOutside } from "../hooks/useClickOutside";
import { cn } from "../utils/cn";
import { roleByName } from "@/config/appConfig";
import {
  User,
  Briefcase,
  Gavel,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

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
    fbUser?.displayName ||
    reduxUser?.full_name ||
    t("profile_dropdown.default_user");
  const initial = displayName.charAt(0).toUpperCase();

  useClickOutside(dropdownRef, () => setIsOpen(false));
  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

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

        <span
          className={cn(
            "font-semibold text-white truncate max-w-[120px]",
            isMobile ? "block" : "hidden sm:block",
          )}
        >
          {displayName}
        </span>

        <ChevronDown
          size={16}
          strokeWidth={2.5}
          className={cn(
            "text-white transition-transform duration-300 ml-auto sm:ml-0",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className={menuContainerClass}>
          <Link
            to="/profile"
            onClick={closeMenu}
            className="px-5 py-3 text-text-main font-semibold hover:bg-bg-body hover:text-primary transition-colors flex items-center gap-3 group"
          >
            <User className="w-5 h-5 text-text-muted transition-colors group-hover:text-primary" />
            {t("profile_dropdown.my_profile")}
          </Link>

          {isOrganizer && (
            <Link
              to="/organizer-panel"
              onClick={closeMenu}
              className="px-5 py-3 text-text-main font-semibold hover:bg-bg-body hover:text-accent transition-colors flex items-center gap-3 group"
            >
              <Briefcase className="w-5 h-5 text-text-muted transition-colors group-hover:text-accent" />
              {t("profile_dropdown.organizer_panel")}
            </Link>
          )}

          {isJury && (
            <Link
              to="/jury-panel"
              onClick={closeMenu}
              className="px-5 py-3 text-text-main font-semibold hover:bg-bg-body hover:text-accent transition-colors flex items-center gap-3 group"
            >
              <Gavel className="w-5 h-5 text-text-muted transition-colors group-hover:text-accent" />
              {t("profile_dropdown.jury_panel")}
            </Link>
          )}

          {isAdmin && (
            <a
              href={`${import.meta.env.VITE_BACKEND_URL}/admin/`}
              onClick={closeMenu}
              className="px-5 py-3 text-text-main font-semibold hover:bg-bg-body hover:text-pink-accent transition-colors flex items-center gap-3 group"
            >
              <Settings className="w-5 h-5 text-text-muted transition-colors group-hover:text-pink-accent" />
              {t("profile_dropdown.admin_panel")}
            </a>
          )}

          <hr className="border-border my-1 mx-3 transition-colors duration-300" />

          <Link
            to="/auth/sign-out"
            onClick={closeMenu}
            className="px-5 py-3 text-red-500 font-semibold hover:bg-red-500/10 transition-colors flex items-center gap-3 group"
          >
            <LogOut className="w-5 h-5 text-red-500 transition-transform group-hover:scale-110" />
            {t("profile_dropdown.logout")}
          </Link>
        </div>
      )}
    </div>
  );
};
