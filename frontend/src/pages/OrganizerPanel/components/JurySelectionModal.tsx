import { useTranslation } from "react-i18next";
import { type Tournament, type User } from "./types";
import {
  Modal,
  ModalPanel,
  ModalSimpleHeader,
  ModalBody,
  ModalFooter,
  modalClass,
} from "@/components/ui/Modal";
import { cn } from "@/utils/cn";

interface JurySelectionModalProps {
  isOpen: boolean;
  selectedTournament: Tournament | null;
  allUsers: User[];
  addedJurors: number[];
  onToggleJuror: (userId: number) => void;
  onClose: () => void;
  onSave: () => void;
}

const JurySelectionModal = ({
  isOpen,
  selectedTournament,
  allUsers = [],
  addedJurors = [],
  onToggleJuror,
  onClose,
  onSave,
}: JurySelectionModalProps) => {
  const { t } = useTranslation("modals");

  return (
    <Modal isOpen={isOpen} onClose={onClose} zIndex={210} closeOnBackdrop>
      <ModalPanel size="md" rounded="md" className="max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <ModalSimpleHeader
          title={t("jury_selection.title")}
          subtitle={
            <>
              {t("common.tournament_label")}{" "}
              <span className="font-semibold text-primary">{selectedTournament?.title}</span>
            </>
          }
          onClose={onClose}
        />

        <ModalBody inset className="p-6">
          {allUsers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-bg-body rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <svg className="w-8 h-8 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-text-muted font-medium">{t("jury_selection.empty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allUsers.map((user) => {
                const isSelected = addedJurors.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onToggleJuror(user.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                      isSelected
                        ? "bg-primary border-primary shadow-md shadow-primary/25"
                        : "bg-bg-card border-border hover:border-primary/40 hover:shadow-sm",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                        isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary",
                      )}
                    >
                      {user.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || t("common.user_initial")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold truncate", isSelected ? "text-white" : "text-text-main")}>
                        {user.full_name}
                      </p>
                      <p className={cn("text-[11px] truncate", isSelected ? "text-indigo-100" : "text-text-muted")}>
                        {user.email}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-white text-primary"
                          : "border border-border group-hover:border-primary/40",
                      )}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t("common.selected")}</p>
            <p className="text-xl font-bold text-text-main">
              {addedJurors.length}{" "}
              <span className="text-sm font-medium text-text-muted">{t("common.experts")}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className={modalClass.secondaryAction}>
              {t("common.cancel")}
            </button>
            <button type="button" onClick={onSave} className={cn(modalClass.primaryAction, "px-8 py-2.5")}>
              {t("common.confirm")}
            </button>
          </div>
        </ModalFooter>
      </ModalPanel>
    </Modal>
  );
};

export { JurySelectionModal };
