import './Profile.css';
import { useSelector } from 'react-redux';
import { auth } from '../../firebase';
import type { RootState } from '../../store';
import { deleteUser } from '@/api/requests';

const Profile = () => {
  const user = useSelector((s: RootState) => s.user);
  const handleDeleteUser = async () => {
    if (!user) return;
    if (!auth.currentUser) return;
    deleteUser(auth.currentUser);
  };
  if (!user) return <div>Loading...</div>

  return (
    <div className="profile-container">
      {/* Головна картка профілю */}
      <div className="card profile-header-card">
        <div className="profile-header-top">
          <div className="profile-info-wrapper">
            <div className="avatar-container">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="profile-details">
              <h1 className="profile-name">{user?.displayName}</h1>
              <span className="role-badge">Роль: Користувач</span>
            </div>
          </div>
          <button className="edit-btn">Редагувати профіль</button>
          <button onClick={handleDeleteUser} className="edit-btn">Видалити профіль</button>
        </div>

        <div className="divider"></div>

        <div className="contact-section">
          <h3 className="section-subtitle">СПОСОБИ ЗВ'ЯЗКУ</h3>
          <div className="contact-methods">
            <div className="contact-chip">
              <span className="contact-label">Email:</span>
              <a href="mailto:hacker777@example.com">hacker777@example.com</a>
            </div>
            <div className="contact-chip blue-chip">
              <span className="contact-label">Telegram:</span>
              <a href="#">@hacker777</a>
            </div>
            <div className="contact-chip">
              <span className="contact-label">GitHub:</span>
              <a href="#">hacker777</a>
            </div>
            <div className="contact-chip purple-chip">
              <span className="contact-label">Discord:</span>
              <a href="#">@hacker777</a>
            </div>
          </div>
        </div>
      </div>

      {/* Нижня сітка з двома колонками */}
      <div className="content-grid">

        {/* Картка Турніри */}
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
              "Напишіть свою операційну систему"
            ].map((item, index) => (
              <div key={index} className="list-item">
                <span>{item}</span>
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Картка Команди */}
        <div className="card list-card">
          <h2 className="card-title">
            <span className="dot yellow-dot"></span> Команди
          </h2>
          <div className="list-container">
            {[
              "Шалені програмісти",
              "Кодери мрії",
              "Лінус Торвальдс"
            ].map((item, index) => (
              <div key={index} className="list-item team-item">
                <div className="robot-icon-wrapper">
                  <svg className="robot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export { Profile };