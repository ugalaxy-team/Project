import React, { useState, type SubmitEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { store, type RootState } from "../../store";
import { setUser } from "@/slices/user";
import { updateProfile } from "@/api/requests/updateProfile";
import { useSelector } from "react-redux";
import { auth } from "@/firebase";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const user = useSelector((s: RootState) => s.user.user);
  // Email should be updated elsewhere, because this process requires confirmation that the new email belongs to user
  const [formData, setFormData] = useState({
    full_name: user?.displayName ?? "",
    telegram: user?.telegram ?? "",
    github: user?.github ?? "",
    discord: user?.discord ?? "",
  });

  const updateMutation = useMutation({
    // Використовуємо uid, або id як запасний варіант
    mutationKey: ["update user", user?.uid],
    mutationFn: async (data: typeof formData) => {
      if (!auth.currentUser) return;
      return await updateProfile(auth.currentUser, data);
    },
    onSuccess: (variables) => {
      store.dispatch(
        setUser({
          ...user,
          displayName: variables.full_name,
          ...variables,
        }),
      );
      onClose();
    },
    onError: (e: any) => {
      console.error("Помилка при оновленні профілю", e.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редагувати профіль</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Повне ім'я</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="divider"></div>
          <h3 className="section-subtitle">Додаткові контакти</h3>

          <div className="form-group">
            <label>Telegram</label>
            <input
              type="text"
              name="telegram"
              value={formData.telegram}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>GitHub</label>
            <input
              type="text"
              name="github"
              value={formData.github}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Discord</label>
            <input
              type="text"
              name="discord"
              value={formData.discord}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Скасувати
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Збереження..." : "Зберегти зміни"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
