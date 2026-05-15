import { useEffect, type ReactNode, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

/** Shared modal class tokens for modals with custom layout */
export const modalClass = {
  overlay:
    "fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm dark:bg-black/70 transition-colors",
  backdrop: "absolute inset-0",
  panel:
    "relative w-full bg-bg-card border border-border shadow-2xl overflow-hidden flex flex-col transition-colors duration-300",
  panelLg: "rounded-[2.5rem]",
  panelMd: "rounded-2xl",
  body: "flex-1 overflow-y-auto bg-bg-body p-6 md:p-8",
  bodyInset: "flex-1 overflow-y-auto bg-bg-body/80 dark:bg-bg-body/50 p-6",
  footer: "p-6 bg-bg-card border-t border-border flex gap-4 shrink-0",
  header: "flex items-center justify-between p-6 border-b border-border shrink-0 bg-bg-card",
  headerTitle: "text-lg font-bold text-text-main",
  headerSubtitle: "text-xs text-text-muted mt-0.5",
  brandedHeader:
    "bg-gradient-to-r from-primary via-primary to-indigo-500 p-6 md:p-8 text-white shrink-0 relative",
  brandedHeaderTitle: "text-xl md:text-2xl font-black uppercase tracking-tight",
  label: "text-[10px] font-black text-text-muted uppercase tracking-widest",
  input:
    "w-full px-5 py-4 bg-bg-card border-2 border-border rounded-2xl outline-none font-bold text-text-main placeholder:text-text-muted/60 focus:border-primary transition-all",
  textarea:
    "w-full px-5 py-4 bg-bg-card border-2 border-border rounded-2xl outline-none font-medium text-text-main resize-none focus:border-primary transition-all",
  card: "bg-bg-card p-5 rounded-2xl border border-border shadow-sm",
  closeBtn:
    "p-2 hover:bg-bg-body rounded-lg transition-colors text-text-muted hover:text-text-main",
  closeBtnBranded:
    "p-2 hover:bg-white/10 rounded-full transition-all text-white",
  iconBox:
    "w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner",
  primaryAction:
    "py-4 bg-primary text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] disabled:bg-border disabled:text-text-muted disabled:shadow-none transition-all",
  secondaryAction:
    "py-4 font-bold text-text-muted uppercase text-[10px] tracking-widest hover:text-text-main transition-colors",
  ghostAction:
    "w-full py-4 bg-bg-body text-text-muted rounded-2xl font-bold uppercase text-[11px] tracking-[0.15em] transition-all hover:bg-border hover:text-text-main active:scale-[0.98]",
} as const;

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  zIndex?: number;
  usePortal?: boolean;
  lockScroll?: boolean;
  className?: string;
  closeOnBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  zIndex = 200,
  usePortal = true,
  lockScroll = true,
  className,
  closeOnBackdrop = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen || !lockScroll) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, lockScroll]);

  if (!isOpen) return null;

  const handleBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
  };

  const el = (
    <div
      className={cn(modalClass.overlay, className)}
      style={{ zIndex }}
      data-modal-overlay
      onClick={handleBackdrop}
    >
      {children}
    </div>
  );

  return usePortal ? createPortal(el, document.body) : el;
}

interface ModalPanelProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  rounded?: "lg" | "md";
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

const sizeClass = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-7xl",
  full: "max-w-[96vw]",
};

export function ModalPanel({
  children,
  className,
  size = "md",
  rounded = "lg",
  onClick,
}: ModalPanelProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        modalClass.panel,
        rounded === "lg" ? modalClass.panelLg : modalClass.panelMd,
        sizeClass[size],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModalBackdrop({ onClose }: { onClose?: () => void }) {
  return <div className={modalClass.backdrop} onClick={onClose} aria-hidden />;
}

interface ModalBrandedHeaderProps {
  title: ReactNode;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
}

export function ModalBrandedHeader({
  title,
  onClose,
  children,
  className,
}: ModalBrandedHeaderProps) {
  const { t } = useTranslation("modals");
  return (
    <div className={cn(modalClass.brandedHeader, className)}>
      <div className="flex justify-between items-center gap-4">
        <h2 className={modalClass.brandedHeaderTitle}>{title}</h2>
        {onClose && (
          <button type="button" onClick={onClose} className={modalClass.closeBtnBranded} aria-label={t("common.close_aria")}>
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function ModalBody({
  children,
  className,
  inset = false,
}: {
  children: ReactNode;
  className?: string;
  inset?: boolean;
}) {
  return <div className={cn(inset ? modalClass.bodyInset : modalClass.body, className)}>{children}</div>;
}

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(modalClass.footer, className)}>{children}</div>;
}

export function ModalSimpleHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
}) {
  const { t } = useTranslation("modals");
  return (
    <div className={modalClass.header}>
      <div>
        <h3 className={modalClass.headerTitle}>{title}</h3>
        {subtitle ? <p className={modalClass.headerSubtitle}>{subtitle}</p> : null}
      </div>
      <button type="button" onClick={onClose} className={modalClass.closeBtn} aria-label={t("common.close_aria")}>
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
