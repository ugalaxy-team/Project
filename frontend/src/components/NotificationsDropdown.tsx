import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "../hooks/useClickOutside";

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("common");
  const notifications = useSelector((s: RootState) => s.notifications.items);

  useClickOutside(dropdownRef, () => setIsOpen(false));
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Тригер залишається білим, бо знаходиться в Primary Хідері */}
      <button
        onClick={toggleMenu}
        aria-label="Notifications"
        className="relative p-2 text-white/80 hover:text-white transition-colors focus:outline-none rounded-full hover:bg-white/10"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-accent border-2 border-primary" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-80 bg-bg-card rounded-xl shadow-2xl py-2 flex flex-col border border-border overflow-hidden z-50 transition-colors duration-300">
          <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-bg-body transition-colors duration-300">
            <h3 className="font-semibold text-text-main">
              {t("notifications.title")}
            </h3>
            <span className="text-xs bg-accent/10 text-accent font-bold py-1 px-2 rounded-full">
              {t("notifications.new_count", { count: notifications.length })}
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div
                  key={`${notification.id}-${index}`}
                  className="px-4 py-4 hover:bg-bg-body border-b border-border last:border-0 transition-colors cursor-pointer"
                >
                  <p className="text-sm text-text-main font-medium leading-relaxed transition-colors duration-300">
                    {notification.body}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 flex flex-col items-center justify-center text-center">
                <svg
                  className="w-12 h-12 text-text-muted/30 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-text-muted text-sm font-medium transition-colors duration-300">
                  {t("notifications.empty")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
