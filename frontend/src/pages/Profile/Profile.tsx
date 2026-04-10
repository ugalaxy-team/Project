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
    onError: (e) => {
      console.log("An error occured while trying to delete account", e.message);
    },
  });
  const handleDeleteUser = async () => {
    if (!auth.currentUser) return;
    deleteUserMutation.mutate();
  };
  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="card profile-header-card">
        <div className="profile-header-top">
          <div className="profile-info-wrapper">
            <div className="avatar-container">
              <svg
                className="avatar-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="profile-details">
              <h1 className="profile-name">{user?.displayName}</h1>
              <span className="role-badge">Роль: Користувач</span>
            </div>
          </div>
          <button onClick={() => setIsEditModalOpen(true)} className="edit-btn">Редагувати профіль</button>
          <button onClick={handleDeleteUser} className="edit-btn">
            Видалити профіль
          </button>
        </div>

        <div className="divider"></div>

        <div className="contact-section">
          <h3 className="section-subtitle">СПОСОБИ ЗВ'ЯЗКУ</h3>
          <div className="contact-methods">
            <div className="contact-chip">
              <span className="contact-label">Email:</span>
              <span className="contact-value">{user.email ?? 'Відсутній'}</span>
            </div>
            <div className="contact-chip blue-chip">
              <span className="contact-label">Telegram:</span>
              <span className="contact-value">{user.telegram ?? 'Відсутній'}</span>
            </div>
            <div className="contact-chip">
              <span className="contact-label">GitHub:</span>
              <span className="contact-value">{user.github ?? 'Відсутній'}</span>
            </div>
            <div className="contact-chip purple-chip">
              <span className="contact-label">Discord:</span>
              <span className="contact-value">{user.discord ?? 'Відсутній'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="card list-card">
          <h2 className="card-title">
            <span className="dot blue-dot"></span> Турніри
          </h2>
          <div className="list-container">
            {[
              "Напишіть Ядро Лінукс",
              "Напишіть свою мову програмування на рівні C++",
              "Напишіть гру на JavaScript",
              "Напишіть чат-бота на Python",
              "Напишіть свою операційну систему",
            ].map((item, index) => (
              <div key={index} className="list-item">
                <span>{item}</span>
                <svg
                  className="chevron-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className="card list-card">
          <h2 className="card-title">
            <span className="dot yellow-dot"></span> Команди
          </h2>
          <div className="list-container">
            {["Шалені програмісти", "Кодери мрії", "Лінус Торвальдс"].map(
              (item, index) => (
                <div key={index} className="list-item team-item">
                  <div className="robot-icon-wrapper">
                    <svg
                      className="robot-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="16" height="12" x="4" y="8" rx="2" />
                      <path d="M2 14h2" />
                      <path d="M20 14h2" />
                      <path d="M15 13v2" />
                      <path d="M9 13v2" />
                      <path d="M12 8V4" />
                      <path d="M12 4h.01" />
                    </svg>
                  </div>
                  <span className="team-name">{item}</span>
                </div>
              ),
            )}
          </div>
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

export { Profile };
