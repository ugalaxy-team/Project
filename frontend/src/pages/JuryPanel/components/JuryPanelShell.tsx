import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface JuryPanelShellProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  headerLeading?: ReactNode;
  children: ReactNode;
}

export function JuryPanelShell({
  eyebrow,
  title,
  description,
  headerLeading,
  children,
}: JuryPanelShellProps) {
  return (
    <div className="min-h-screen bg-bg-body pb-16 font-nunito text-text-main transition-colors duration-500 md:pb-24">
      <header className="relative overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-indigo-900 px-4 pb-28 pt-16 text-white ring-1 ring-inset ring-white/10 sm:px-6 md:pb-36 md:pt-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, white 0%, transparent 45%),
              radial-gradient(circle at 80% 0%, rgba(251, 191, 36, 0.35) 0%, transparent 40%),
              linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)`,
          }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-6xl">
          {headerLeading ? <div className="mb-6">{headerLeading}</div> : null}
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-100/90">{eyebrow}</p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-1 w-14 shrink-0 rounded-full bg-accent shadow-[0_0_20px_rgba(251,191,36,0.45)]" />
              <h1 className="mt-4 text-3xl font-black tracking-tight !text-white sm:text-4xl md:text-5xl">
                {title}
              </h1>
            </div>
          </div>
          {description ? (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-indigo-100/95 md:text-base">{description}</p>
          ) : null}
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24">
        <section
          className={cn(
            "rounded-[2rem] border border-border bg-bg-card p-6 shadow-[0_24px_60px_-12px_rgba(79,70,229,0.18)] ring-1 ring-border/40 transition-colors duration-500",
            "dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)] md:p-9 lg:p-10",
          )}
        >
          {children}
        </section>
      </div>
    </div>
  );
}
