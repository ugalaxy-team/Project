import { useState, type FC } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";

import { auth } from "../../firebase";
import { store, type RootState } from "../../store";
import { deleteUser } from "@/api/requests";
import { setUser } from "@/slices/user";
import { EditProfileModal } from "./EditProfileModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface UserRole {
  name: string;
  display_name?: string;
}

interface UserData {
  id: string | number;
  displayName?: string;
  full_name?: string;
  email: string;
  telegram?: string;
  github?: string;
  discord?: string;
  roles?: UserRole[];
  created_tournaments?: Array<{ id: number; title?: string; name?: string }>;
}

interface ContactChipProps {
  label: string;
  value?: string | null;
  colorClass?: string;
}

interface ListCardProps {
  title: string;
  dotColor: string;
  items: string[];
  isTeams?: boolean;
}

const Profile: FC = () => {
  const { t } = useTranslation("profile");
  const user = useSelector((s: RootState) => s.user.user as UserData | null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const deleteUserMutation = useMutation({
    mutationKey: ["delete user"],
    mutationFn: async () => {
      if (!auth.currentUser) throw new Error(t("errors.not_authorized"));
      await deleteUser(auth.currentUser);
    },
    onSuccess: async () => {
      await auth.updateCurrentUser(null);
      store.dispatch(setUser(null));
    },
    onError: (e: Error) => {
      console.error("An error occurred:", e.message);
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-body text-text-muted transition-colors">
        {t("loading")}
      </div>
    );
  }

  const isOrganizer =
    user.roles?.some(
      (role) =>
        role.name.toLowerCase() === "organizer" ||
        role.name.toLowerCase() === "admin"
    ) ?? false;

  const userTournaments =
    user.created_tournaments && user.created_tournaments.length > 0
      ? user.created_tournaments.map(
          (t) => t.title || t.name || t("tournament_unnamed"),
        )
      : [t("no_tournaments")];

  return (
    <div className="min-h-screen bg-bg-body p-4 pt-24 md:p-10 md:pt-32 font-nunito text-text-main transition-colors">
      <div className="max-w-[1000px] mx-auto space-y-6">
        <div className="bg-bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-[100px] h-[100px] bg-border/30 rounded-full flex items-center justify-center border-4 border-bg-body ring-1 ring-border text-text-muted shrink-0 transition-colors">
                <svg
                  className="w-12 h-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <div className="flex flex-col items-center sm:items-start gap-2">
                <h1 className="text-2xl font-bold">
                  {user.displayName || user.full_name || t("unnamed")}
                </h1>
                <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-bold transition-colors">
                  {t("role")}:{" "}
                  {user.roles && user.roles.length > 0
                    ? user.roles.map((r) => r.display_name || r.name).join(", ")
                    : t("no_roles")}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsEditModalOpen(true)}
              >
                {t("edit_profile")}
              </Button>

              <Button
                variant="outline"
                size="md"
                isLoading={deleteUserMutation.isPending}
                className="border-red-500/30 text-red-500 hover:border-red-500 hover:text-red-600 hover:shadow-red-500/15"
                onClick={() => {
                  if (confirm(t("confirm_delete"))) deleteUserMutation.mutate();
                }}
              >
                {t("delete_account")}
              </Button>
            </div>
          </div>

          <div className="my-8 h-[1px] bg-border transition-colors"></div>

          <div>
            <h3 className="text-xs font-black text-text-muted tracking-widest uppercase mb-4 transition-colors">
              {t("contact_methods")}
            </h3>
            <div className="flex flex-wrap gap-3">
              <ContactChip label="Email" value={user.email} />
              <ContactChip
                label="Telegram"
                value={user.telegram}
                colorClass="bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
              />
              <ContactChip label="GitHub" value={user.github} />
              <ContactChip
                label="Discord"
                value={user.discord}
                colorClass="bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400"
              />
            </div>
          </div>
        </div>

        {isOrganizer && (
          <div className="grid grid-cols-1 mb-10">
            <ListCard
              title={t("tournaments")}
              dotColor="bg-primary"
              items={userTournaments}
              emptyMessage={t("no_tournaments")}
            />
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user}
      />
    </div>
  );
};

const ContactChip: FC<ContactChipProps> = ({
  label,
  value,
  colorClass = "bg-bg-body border-border text-text-main",
}) => {
  const { t } = useTranslation("profile");

  return (
    <div
      className={cn(
        "flex gap-1.5 px-4 py-2 rounded-lg border text-sm font-bold transition-colors",
        colorClass,
      )}
    >
      <span className="opacity-60">{label}:</span>
      <span>{value ?? t("missing")}</span>
    </div>
  );
};

const ListCard: FC<ListCardProps & { emptyMessage: string }> = ({
  title,
  dotColor,
  items,
  isTeams = false,
  emptyMessage,
}) => (
  <div className="bg-bg-card border border-border rounded-2xl p-6 shadow-sm transition-colors">
    <h2 className="flex items-center gap-2.5 text-lg font-bold mb-6 text-text-main transition-colors">
      <span className={cn("w-2 h-2 rounded-full", dotColor)}></span> {title}
    </h2>
    <div className="space-y-3">
      {items.length > 0 ? (
        items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-bg-body border border-border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              {isTeams && (
                <div className="w-8 h-8 bg-border/50 rounded-full flex items-center justify-center text-text-muted transition-colors">
                  🤖
                </div>
              )}
              <span className="font-bold text-text-main transition-colors">
                {item}
              </span>
            </div>
            {!isTeams && (
              <span className="text-border group-hover:text-primary transition-colors">
                ❯
              </span>
            )}
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-text-muted text-sm font-medium border border-dashed border-border rounded-xl">
          {emptyMessage}
        </div>
      )}
    </div>
  </div>
);

export { Profile };