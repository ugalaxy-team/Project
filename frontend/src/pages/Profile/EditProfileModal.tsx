import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { store, type RootState } from "../../store";
import { setUser } from "@/slices/user";
import { updateProfile } from "@/api/requests/updateProfile";
import { useSelector } from "react-redux";
import { auth } from "@/firebase";

interface ProfileFormData {
  full_name: string;
  telegram: string;
  github: string;
  discord: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const user = useSelector((s: RootState) => s.user.user);

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: user?.displayName ?? "",
    telegram: user?.telegram ?? "",
    github: user?.github ?? "",
    discord: user?.discord ?? "",
  });

  const updateMutation = useMutation({
    mutationKey: ["update user", user?.uid],
    mutationFn: async (data: ProfileFormData) => {
      if (!auth.currentUser) throw new Error("User not authenticated");
      return await updateProfile(auth.currentUser, data);
    },
    onSuccess: (response, variables) => {
      if (user) {
        store.dispatch(
          setUser({
            ...user,
            displayName: variables.full_name,
            telegram: variables.telegram,
            github: variables.github,
            discord: variables.discord,
          })
        );
      }
      onClose();
    },
    onError: (error: any) => {
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редагувати профіль</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
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