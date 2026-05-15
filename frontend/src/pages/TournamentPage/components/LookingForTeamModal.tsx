import { useTranslation } from "react-i18next";
import { Modal, ModalPanel, modalClass } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";

interface LookingForTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LookingForTeamModal = ({ isOpen, onClose }: LookingForTeamModalProps) => {
  const { t } = useTranslation("modals");

  return (
    <Modal isOpen={isOpen} onClose={onClose} zIndex={200}>
      <ModalPanel size="sm" className="max-h-[90vh]">
        <div className={cn(modalClass.brandedHeader, "p-8")}>
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {t("looking_for_team.title")}
          </h2>
        </div>

        <div className="p-10 bg-bg-body text-center">
          <div className={modalClass.iconBox}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <h3 className="text-2xl font-black text-text-main uppercase mb-4 tracking-tight">
            {t("looking_for_team.heading")}
          </h3>

          <p className="text-text-muted font-medium mb-8 leading-relaxed">
            {t("looking_for_team.description")}
          </p>

          <div className="space-y-3">
            <a href="/contact" className={cn(modalClass.primaryAction, "block w-full text-center")}>
              {t("looking_for_team.contact_cta")}
            </a>

            <button type="button" onClick={onClose} className={modalClass.ghostAction}>
              {t("common.close")}
            </button>
          </div>
        </div>
      </ModalPanel>
    </Modal>
  );
};
