import "./Profile.css";
import { useSelector } from "react-redux";
import { auth } from "../../firebase";
import { store, type RootState } from "../../store";
import { deleteUser } from "@/api/requests";
import { useMutation } from "@tanstack/react-query";
import { setUser } from "@/slices/user";
import { useState } from "react";
import { EditProfileModal } from "./EditProfileModal";

const Profile = () => {
  const user = useSelector((s: RootState) => s.user.user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const deleteUserMutation = useMutation({
    mutationKey: ["delete user"],
    mutationFn: async () => {
      if (!auth.currentUser) return;
      await deleteUser(auth.currentUser);
    },
    onSuccess: async () => {
      await auth.updateCurrentUser(null);
      store.dispatch(setUser(null));
    },
    onError: (e: any) => {
      console.log("An error occured", e.message);
    },
  });

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-[#111827]">
      <div className="max-w-[1000px] mx-auto space-y-6">
        <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-[100px] h-[100px] bg-[#f3f4f6] rounded-full flex items-center justify-center border-4 border-[#f9fafb] ring-1 ring-[#e5e7eb] text-[#9ca3af] shrink-0">
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
                  {user?.displayName || user?.full_name}
                </h1>
                <span className="bg-[#6366F1] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  Роль:{" "}
                  {user?.roles?.length > 0
                    ? user.roles
                        .map((r: any) => r.display_name || r.name)
                        .join(", ")
                    : "Немає ролей"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-[#FBBF24] hover:opacity-90 text-[#111827] px-6 py-2.5 rounded-full font-bold text-sm transition-all"
              >
                Редагувати профіль
              </button>
              <button
                onClick={() => deleteUserMutation.mutate()}
                className="bg-[#fee2e2] hover:bg-[#fecaca] text-[#ef4444] px-6 py-2.5 rounded-full font-bold text-sm transition-all"
              >
                Видалити
              </button>
            </div>
          </div>

          <div className="my-8 h-[1px] bg-[#e5e7eb]"></div>

          <div>
            <h3 className="text-xs font-bold text-[#6b7280] tracking-widest uppercase mb-4">
              СПОСОБИ ЗВ'ЯЗКУ
            </h3>
            <div className="flex flex-wrap gap-3">
              <ContactChip label="Email" value={user.email} />
              <ContactChip
                label="Telegram"
                value={user.telegram}
                colorClass="bg-[#eff6ff] border-[#bfdbfe] text-[#2563eb]"
              />
              <ContactChip label="GitHub" value={user.github} />
              <ContactChip
                label="Discord"
                value={user.discord}
                colorClass="bg-[#f5f3ff] border-[#ddd6fe] text-[#7c3aed]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 mb-10">
          <ListCard
            title="Турніри"
            dotColor="bg-[#6366F1]"
            items={[
              "Напишіть Ядро Лінукс",
              "Напишіть свою мову програмування",
              "Напишіть гру на JS",
            ]}
          />
        </div>
      </div>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user}
      />
    </div>
  );
};

const ContactChip = ({
  label,
  value,
  colorClass = "bg-[#f3f4f6] border-[#e5e7eb] text-[#111827]",
}) => (
  <div
    className={`flex gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium ${colorClass}`}
  >
    <span className="opacity-60">{label}:</span>
    <span>{value ?? "Відсутній"}</span>
  </div>
);

const ListCard = ({ title, dotColor, items, isTeams = false }) => (
  <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-6 shadow-sm">
    <h2 className="flex items-center gap-2.5 text-lg font-bold mb-6">
      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span> {title}
    </h2>
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl hover:bg-[#f3f4f6] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {isTeams && (
              <div className="w-8 h-8 bg-[#e5e7eb] rounded-full flex items-center justify-center text-[#4b5563]">
                🤖
              </div>
            )}
            <span className="font-medium">{item}</span>
          </div>
          {!isTeams && <span className="text-gray-300">❯</span>}
        </div>
      ))}
    </div>
  </div>
);

export { Profile };
