import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import star from './star.json';
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { requestRole } from '@/api/requests/requestRole';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '@/api/client';
import { auth } from '@/firebase';

interface Role {
    name: string;
    display_name: string;
    description: string;
}

const RoleRequestPage = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const navigate = useNavigate();

    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await apiClient.get('/roles/');
                const data: Role[] = response.data;
                const filteredRoles = data.filter(role => role.name !== 'user');
                setRoles(filteredRoles);
                if (filteredRoles.length > 0) {
                    setSelectedRole(filteredRoles[0]);
                }
            } catch (error) {
                toast.error("Не вдалося завантажити список ролей");
            } finally {
                setIsLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    const createRequests = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) {
            toast.error("Користувач не знайдений або не авторизований!");
            return;
        }

        if (!selectedRole) {
            toast.error("Будь ласка, оберіть роль, на яку подаєте заявку!");
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
            if (!auth.currentUser) return;
            await requestRole(selectedRole.name, auth.currentUser, user.id, info);
            toast.success("Заявку відправлено! Очікуйте на відповідь");
            form.reset();
            navigate("/");
        } catch (error: any) {
            if (error.response && error.response.status === 400) {
                if (error.response.data?.detail === "Role requests already exists!") {
                    toast.error("Ви вже подавали заявку на цю роль! Очікуйте на рішення.");
                    return;
                }
            }
            toast.error("Щось пішло не так. Спробуйте пізніше.");
        }
    }

    const inputClasses = "peer w-full px-[18px] pt-6 pb-2 border border-slate-200 rounded-xl bg-[#fafafa] text-sm text-gray-800 transition-all focus:outline-none focus:border-[#7b00ff] focus:bg-white focus:shadow-[0_0_0_3px_rgba(123,0,255,0.1)] placeholder-transparent";
    const labelClasses = "absolute left-[18px] top-1.5 text-[11px] font-medium text-[#7b00ff] pointer-events-none transition-all peer-placeholder-shown:top-[18px] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-[#7b00ff] peer-focus:font-medium";

    return (
        <div className="flex flex-col md:flex-row min-h-screen font-sans bg-[#f7f8fc]">
            <div className="flex-1 bg-[#7b00ff] text-white flex flex-col items-center justify-center p-10">
                <div className="max-w-[480px] text-center md:text-left">
                    <div className="text-[64px] mb-2.5 text-center">
                        <Lottie
                            animationData={star}
                            loop={true}
                            style={{ width: 120, height: 120, margin: '0 auto' }}
                        />
                    </div>
                    <h2 className="text-[32px] m-0 font-extrabold text-center">UGalaxy</h2>
                    <p className="text-sm tracking-[2px] mt-1 mb-10 opacity-90 text-center">STAR FOR LIFE</p>

                    <h1 className="text-[28px] font-extrabold text-white mt-0 mb-4 leading-[1.2]">
                        Заявка на роль {selectedRole ? selectedRole.display_name.toLowerCase() : '...'}
                    </h1>
                    <p className="text-[15px] text-white/85 leading-[1.6] mb-6">
                        {selectedRole ? selectedRole.description : 'Заповніть форму нижче, щоб подати заявку. Ми розглядаємо кожну заявку вручну.'}
                        <br /><br />
                        <b className="font-bold">Важливо:</b> відповідайте чесно та детально — це підвищує ваші шанси.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-10 px-5">
                <div className="bg-white w-full max-w-[420px] p-10 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <div className="mb-6">
                        <p className="mb-3 font-semibold text-gray-800">Оберіть бажану роль:</p>
                        {isLoadingRoles ? (
                            <p className="text-gray-500 text-sm animate-pulse">Завантаження ролей...</p>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {roles.map((role) => {
                                    const isActive = selectedRole?.name === role.name;
                                    return (
                                        <button
                                            key={role.name}
                                            type="button"
                                            onClick={() => setSelectedRole(role)}
                                            className={`px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm md:text-base font-medium border-2 ${isActive
                                                ? 'border-[#7b00ff] bg-[#7b00ff]/10 text-[#7b00ff] shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                                }`}
                                        >
                                            {role.display_name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <p className="text-[13px] text-[#7b00ff] font-bold mb-4">* — обов'язкове поле</p>
                    <form className="flex flex-col gap-4" onSubmit={createRequests}>
                        <div className="relative w-full">
                            <input type="text" id="fullName" name="fullName" placeholder=" " required className={inputClasses} />
                            <label htmlFor="fullName" className={labelClasses}>ПІБ *</label>
                        </div>

                        <div className="relative w-full">
                            <input type="text" id="contact" name="contact" placeholder=" " required className={inputClasses} />
                            <label htmlFor="contact" className={labelClasses}>Email / Telegram *</label>
                        </div>

                        <div className="relative w-full">
                            <input type="number" id="age" name="age" placeholder=" " required className={inputClasses} />
                            <label htmlFor="age" className={labelClasses}>Ваш вік *</label>
                        </div>

                        <div className="relative w-full">
                            <textarea id="experience" name="experience" placeholder=" " rows={2} required className={`${inputClasses} min-h-[80px] resize-y`}></textarea>
                            <label htmlFor="experience" className={labelClasses}>Чи маєте релевантний досвід? *</label>
                        </div>

                        <div className="relative w-full">
                            <textarea id="reason" name="reason" placeholder=" " rows={3} required className={`${inputClasses} min-h-[80px] resize-y`}></textarea>
                            <label htmlFor="reason" className={labelClasses}>Чому ви хочете отримати цю роль? *</label>
                        </div>

                        <div className="relative w-full">
                            <textarea id="plans" name="plans" placeholder=" " rows={3} required className={`${inputClasses} min-h-[80px] resize-y`}></textarea>
                            <label htmlFor="plans" className={labelClasses}>Що ви плануєте робити на цій ролі? *</label>
                        </div>

                        <button
                            type="submit"
                            className="mt-2.5 p-4 bg-[#7b00ff] text-white border-none rounded-full text-base font-bold cursor-pointer transition-all hover:bg-[#6a00e0] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedRole || isLoadingRoles}
                        >
                            Надіслати форму
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export { RoleRequestPage }