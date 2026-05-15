import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TABS } from "../config";
import type { TabId } from "../types";

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export const TabNavigation = ({
  activeTab,
  onTabChange,
}: TabNavigationProps) => {
  const { t } = useTranslation("tournament");
  const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);
    const activeElement = tabsRef.current[activeIndex];

    if (activeElement) {
      setLineStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="flex justify-start md:justify-center mb-6 md:mb-10 relative overflow-x-auto no-scrollbar w-full">
      <div className="flex gap-6 md:gap-8 relative pb-4 min-w-max px-2">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabsRef.current[index] = el;
            }}
            onClick={() => onTabChange(tab.id)}
            className={`font-quicksand font-bold text-[18px] md:text-[22px] cursor-pointer relative z-10 transition-colors duration-300 px-2 py-1 ${
              activeTab === tab.id
                ? "text-primary"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            {t(`tabs.${tab.id}`)}
          </button>
        ))}
        <div
          className="absolute bottom-0 h-[3px] md:h-[4px] bg-primary rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 shadow-[0_0_10px_rgba(var(--color-primary),0.5)]"
          style={{
            left: `${lineStyle.left}px`,
            width: `${lineStyle.width}px`,
          }}
        />
      </div>
    </div>
  );
};
