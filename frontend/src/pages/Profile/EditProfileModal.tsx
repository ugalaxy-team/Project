import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { store } from "../../store";
import { setUser } from "@/slices/user";
import { updateUser } from "@/api/requests/updateUser"; 

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    full_name: currentUser?.displayName || "",
    email: currentUser?.email || "hacker777@example.com",
    telegram: currentUser?.telegram || "",
    github: currentUser?.github || "",
    discord: currentUser?.discord || "",
  });

  const updateMutation = useMutation({
    // Використовуємо uid, або id як запасний варіант
    mutationKey: ["update user", currentUser?.uid || currentUser?.id],
    mutationFn: async (data: typeof formData) => {
        const userId = currentUser.uid || currentUser.id;
        if (!userId) throw new Error("ID користувача не знайдено!");
        
        return await updateUser(userId, data);
    },
    onSuccess: (variables) => {
        store.dispatch(
          setUser({ 
              ...currentUser, 
              displayName: variables.full_name, 
              ...variables 
          })
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

  const handleSubmit = (e: React.FormEvent) => {
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
            <label>Повне ім'я (full_name)</label>
            <input 
              type="text" 
              name="full_name" 
              value={formData.full_name} 
              onChange={handleChange} 
              className="form-input"
              required 
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="form-input"
              required 
            />
          </div>

          <div className="divider"></div>
          <h3 className="section-subtitle">Додаткові контакти</h3>

          <div className="form-group">
            <label>Telegram</label>
            <input type="text" name="telegram" value={formData.telegram} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label>GitHub</label>
            <input type="text" name="github" value={formData.github} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label>Discord</label>
            <input type="text" name="discord" value={formData.discord} onChange={handleChange} className="form-input" />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Скасувати</button>
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