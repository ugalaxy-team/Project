import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { roleByName } from "@/config/appConfig";

interface ProfileDropdownProps {
  userRoles?: any[]; 
  isMobile?: boolean;
}

export const ProfileDropdown = ({ userRoles = [], isMobile = false }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
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

  const isAdmin = hasRole(roleByName.admin.name);
  const isOrganizer = hasRole(roleByName.organizer.name);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const wrapperClass = isMobile ? "w-full" : "relative";
  
  const buttonClass = isMobile
    ? "flex items-center gap-2 font-semibold text-[18px] py-2 text-white hover:text-accent transition-colors w-full"
    : "btn btn-outline py-2.5 px-7 text-base flex items-center gap-2 transition-all hover:shadow-md";

  const menuContainerClass = isMobile
    ? "w-full bg-white rounded-xl shadow-md py-2 flex flex-col mt-2 overflow-hidden animate-in slide-in-from-top-2"
    : "absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl py-2 flex flex-col border border-gray-100 overflow-hidden z-50";

  return (
    <div className={wrapperClass} ref={dropdownRef}>
      <button onClick={toggleMenu} className={buttonClass}>
        Профіль
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={menuContainerClass}>
          <Link
            to="/profile"
            onClick={closeMenu}
            className="px-5 py-3 text-gray-700 font-semibold hover:bg-gray-50 hover:text-accent transition-colors flex items-center gap-3"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Мій профіль
          </Link>

          {isOrganizer && (
            <Link
              to="/organizer-panel"
              onClick={closeMenu}
              className="px-5 py-3 text-gray-700 font-semibold hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Панель організатора
            </Link>
          )}

          {isAdmin && (
            <a
              href={`${import.meta.env.VITE_BACKEND_URL}/admin/`}
              onClick={closeMenu}
              className="px-5 py-3 text-gray-700 font-semibold hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Адмін-панель
            </a>
          )}
          
          <hr className="border-gray-100 my-1 mx-3" />
          
          <Link
            to="/auth/sign-out"
            onClick={closeMenu}
            className="px-5 py-3 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center gap-3"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Вийти
          </Link>
        </div>
      )}
    </div>
  );
};
