import { useTranslation } from "react-i18next";
import type { TaskInfo } from "../../types";

interface DescriptionTabProps {
  description: string;
  tasks?: TaskInfo[];
  activeTask?: TaskInfo | null;
}

export const DescriptionTab = ({ description }: DescriptionTabProps) => {
  const { t } = useTranslation("tournament");

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] flex flex-col gap-8 md:gap-12">
      <section>
        <h2 className="text-[24px] md:text-[32px] text-text-main font-quicksand font-black mb-4 md:mb-6 border-b border-border pb-4 transition-colors duration-300">
          {t("description.title")}
        </h2>
        <p className="text-[16px] md:text-[18px] text-text-muted leading-[1.8] whitespace-pre-wrap font-medium transition-colors duration-300">
          {description}
        </p>
      </section>
    </div>
  );
};
