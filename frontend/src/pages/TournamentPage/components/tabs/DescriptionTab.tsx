import type { TaskInfo } from "../../types";

interface DescriptionTabProps {
  description: string;
  tasks?: TaskInfo[];
  activeTask?: TaskInfo | null;
}


export const DescriptionTab = ({
  description,
}: DescriptionTabProps) => {

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] flex flex-col gap-12">
      <section>
        <h2 className="text-[28px] md:text-[32px] text-dark-theme font-quicksand font-black mb-6 border-b border-slate-100 pb-4">
          Що потрібно зробити?
        </h2>
        <p className="text-[17px] md:text-[18px] text-slate-600 leading-[1.8] whitespace-pre-wrap font-medium">
          {description}
        </p>
      </section>
    </div>
  );
};
