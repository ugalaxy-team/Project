import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleMenu}
        className="btn btn-outline py-2.5 px-7 text-base flex items-center gap-2 transition-all hover:shadow-md"
      >
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
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 flex flex-col border border-gray-100 overflow-hidden z-50">
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