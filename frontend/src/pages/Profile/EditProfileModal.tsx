import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { store } from "../../store";
import { setUser } from "@/slices/user";
import { updateProfile } from "@/api/requests/updateProfile";
import { auth } from "@/firebase";
import { Button } from "@/components/ui/Button";

interface ProfileFormData {
  full_name: string;
  telegram: string;
  github: string;
  discord: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const { t } = useTranslation("profile");

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: currentUser?.displayName ?? currentUser?.full_name ?? "",
    telegram: currentUser?.telegram ?? "",
    github: currentUser?.github ?? "",
    discord: currentUser?.discord ?? "",
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.displayName ?? currentUser.full_name ?? "",
        telegram: currentUser.telegram ?? "",
        github: currentUser.github ?? "",
        discord: currentUser.discord ?? "",
      });
    }
  }, [currentUser]);

  const updateMutation = useMutation({
    mutationKey: ["update user", auth.currentUser?.uid],
    mutationFn: async (data: ProfileFormData) => {
      if (!auth.currentUser) throw new Error(t("errors.not_authorized"));
      return await updateProfile(auth.currentUser, data);
    },
    onSuccess: (_, variables) => {
      if (currentUser) {
        store.dispatch(
          setUser({
            ...currentUser,
            displayName: variables.full_name,
            full_name: variables.full_name,
            telegram: variables.telegram,
            github: variables.github,
            discord: variables.discord,
          }),
        );
      }
      onClose();
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm dark:bg-black/70"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-md bg-bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-text-main font-nunito">
                {t("modal.title")}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-text-muted hover:text-text-main hover:bg-bg-body rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-main font-nunito">
                  {t("modal.full_name")}
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-bg-body border border-border text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-border"></div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">
                  {t("modal.contacts_subtitle")}
                </h3>
                <div className="h-px flex-1 bg-border"></div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main font-nunito">
                    Telegram
                  </label>
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleChange}
                    placeholder="@username"
                    className="w-full px-4 py-3 rounded-xl bg-bg-body border border-border text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main font-nunito">
                    GitHub
                  </label>
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full px-4 py-3 rounded-xl bg-bg-body border border-border text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main font-nunito">
                    Discord
                  </label>
                  <input
                    type="text"
                    name="discord"
                    value={formData.discord}
                    onChange={handleChange}
                    placeholder="username#0000"
                    className="w-full px-4 py-3 rounded-xl bg-bg-body border border-border text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={updateMutation.isPending}
                >
                  {t("modal.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={updateMutation.isPending}
                >
                  {t("modal.save")}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
