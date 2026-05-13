interface StatItemProps {
  value: string;
  label: string;
}

export const StatItem = ({ value, label }: StatItemProps) => (
  <div className="flex flex-col items-center font-quicksand group cursor-default">
    <span className="font-bold text-[36px] text-accent leading-none mb-2 tracking-wider group-hover:scale-110 transition-transform duration-300">
      {value}
    </span>
    <span className="text-[13px] opacity-70 group-hover:opacity-100 transition-opacity text-white font-bold tracking-[0.15em] uppercase">
      {label}
    </span>
  </div>
);
