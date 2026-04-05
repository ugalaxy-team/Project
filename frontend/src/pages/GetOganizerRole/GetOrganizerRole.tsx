import './GetOrganizerRole.css';
import Lottie from 'lottie-react';
import star from './star.json'; 
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { roleRequest } from '@/api/requests/roleRequest';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const GetOrganizerRole = () => {
    const currentUser = useSelector((state: RootState) => state.user);
    const navigate = useNavigate(); 

    const createRequests = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        if (!currentUser?.id) {
            toast.error("Користувач не знайдений або не авторизований!");
            return;
        }

        const form = e.currentTarget;
        const formData = new FormData(form);

        const info = [
            { option_name: "ПІБ", value: formData.get("fullName") as string },
            { option_name: "Контакти", value: formData.get("contact") as string },
            { option_name: "Вік", value: formData.get("age") as string },
            { option_name: "Досвід", value: formData.get("experience") as string },
            { option_name: "Причина", value: formData.get("reason") as string },
            { option_name: "Плани", value: formData.get("plans") as string },
        ];

        try {
            const status = await roleRequest("user", currentUser.id, info);
            console.log("Успішний статус:", status);
            
            toast.success("Заявку відправлено! Очікуйте на відповідь");
            form.reset();
            navigate("/"); 

        } catch (error: any) {
            console.error("Помилка відправки заявки:", error);
            if (error.response && error.response.status === 400) {
                if (error.response.data?.detail === "Role requests already exists!") {
                    toast.error("Ви вже подавали заявку на цю роль! Очікуйте на рішення.");
                    return;
                }
            }
            toast.error("Щось пішло не так. Спробуйте пізніше.");
        }
    }

    return(
        <div className="page-layout">
            <div className="brand-panel">
                <div className="brand-content">
                    <div className="logo-placeholder">
                        <Lottie 
                            animationData={star} 
                            loop={true} 
                            style={{ width: 120, height: 120, margin: '0 auto' }} 
                        />
                    </div>
                    <h2>UGalaxy</h2>
                    <p className="brand-subtitle">STAR FOR LIFE</p>
                    <h1 className="form-title">Заявка на роль організатора</h1>
                    <p className="form-description">
                        Заповніть форму нижче, щоб подати заявку. Ми розглядаємо кожну заявку вручну.
                        <br/><br/>
                        <b>Важливо:</b> відповідайте чесно та детально — це підвищує ваші шанси.
                    </p>
                </div>
            </div>

            <div className="form-panel">
                <div className="form-card">
                    <p className="form-note"><strong>* — обов'язкове поле</strong></p>
                    <form className="role-form" onSubmit={createRequests}>
                        <div className="input-group">
                            <input type="text" id="fullName" name="fullName" placeholder=" " required />
                            <label htmlFor="fullName">ПІБ *</label>
                        </div>

                        <div className="input-group">
                            <input type="text" id="contact" name="contact" placeholder=" " required />
                            <label htmlFor="contact">Email / Telegram *</label>
                        </div>

                        <div className="input-group">
                            <input type="number" id="age" name="age" placeholder=" " required />
                            <label htmlFor="age">Ваш вік *</label>
                        </div>
                        
                        <div className="input-group">
                            <textarea id="experience" name="experience" placeholder=" " rows={2} required></textarea>
                            <label htmlFor="experience">Чи маєте досвід організації чогось? *</label>
                        </div>

                        <div className="input-group">
                            <textarea id="reason" name="reason" placeholder=" " rows={3} required></textarea>
                            <label htmlFor="reason">Чому ви хочете стати організатором? *</label>
                        </div>

                        <div className="input-group">
                            <textarea id="plans" name="plans" placeholder=" " rows={3} required></textarea>
                            <label htmlFor="plans">Що ви плануєте робити на цій ролі? *</label>
                        </div>

                        <button type="submit" className="submit-button">Надіслати форму</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export { GetOrganizerRole }