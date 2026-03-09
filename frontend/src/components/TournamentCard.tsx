import React from "react";

interface Tag {
  label: string;
  type: "accent" | "light" | "pink" | "custom";
  customStyle?: React.CSSProperties;
}

interface TournamentCardProps {
  title: string;
  description: string;
  tags: Tag[];
  buttonText: string;
  buttonClass: string;
  cardStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
}

const tagColors = {
  accent: "bg-accent text-slate-900",
  light: "bg-slate-100 text-slate-500",
  pink: "bg-pink-100 text-pink-700",
  custom: "",
};

export const TournamentCard = ({
  title,
  description,
  tags,
  buttonText,
  buttonClass,
  cardStyle,
  buttonStyle,
}: TournamentCardProps) => {
  const isDefaultWhiteCard = !cardStyle?.backgroundColor;
  const isOutline = buttonClass.includes("btn-outline");

  return (
    <div
      className={`w-full h-full rounded-[32px] p-8 flex flex-col relative shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] transition-shadow duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] ${
        isDefaultWhiteCard ? "bg-bg-card border border-slate-200" : ""
      }`}
      style={cardStyle}
    >
      <div className="flex-grow flex flex-col">
        <div className="flex gap-2 mb-5 flex-wrap">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={`px-4 py-2 rounded-full text-[13px] font-bold ${tagColors[tag.type]}`}
              style={tag.customStyle}
            >
              {tag.label}
            </span>
          ))}
        </div>

        <h3
          className="text-[28px] mb-3 leading-[1.2] font-quicksand font-extrabold"
          style={cardStyle?.color ? { color: cardStyle.color } : {}}
        >
          {title}
        </h3>

        <p
          className="text-slate-500 text-[16px] leading-relaxed"
          style={cardStyle?.color ? { color: "rgba(255, 255, 255, 0.7)" } : {}}
        >
          {description}
        </p>
      </div>

      <div className="mt-6">
        <button
          className={`btn w-full xl:w-auto ${buttonClass} ${
            isOutline ? "border-solid border-2" : ""
          } ${
            isOutline && isDefaultWhiteCard
              ? "hover:bg-slate-50 font-extrabold"
              : ""
          }`}
          style={{
            borderStyle: isOutline ? "solid" : undefined,
            ...buttonStyle,
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
