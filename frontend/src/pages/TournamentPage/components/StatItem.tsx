interface StatItemProps {
  value: string;
  label: string;
}

export const StatItem = ({ value, label }: StatItemProps) => (
  <div className="flex flex-col items-center font-quicksand cursor-default">
    <span className="font-bold text-[36px] text-accent leading-none mb-2 tracking-wider text-center">
      {value}
    </span>
    <span className="text-[13px] opacity-70 text-text-main font-bold tracking-[0.15em] uppercase text-center">
      {label}
    </span>
  </div>
);
