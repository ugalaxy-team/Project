import './GetOrganizerRole.css';
import Lottie from 'lottie-react';
import star from './star.json'; 

const GetOrganizerRole = () => {
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
                    <form className="role-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="input-group">
                            <input type="text" id="fullName" placeholder=" " required />
                            <label htmlFor="fullName">ПІБ *</label>
                        </div>

                        <div className="input-group">
                            <input type="text" id="contact" placeholder=" " required />
                            <label htmlFor="contact">Email / Telegram *</label>
                        </div>

                        <div className="input-group">
                            <input type="number" id="age" placeholder=" " required />
                            <label htmlFor="age">Ваш вік *</label>
                        </div>
                        
                        <div className="input-group">
                            <textarea id="experience" placeholder=" " rows="2" required></textarea>
                            <label htmlFor="experience">Чи маєте досвід організації чогось? *</label>
                        </div>

                        <div className="input-group">
                            <textarea id="reason" placeholder=" " rows="3" required></textarea>
                            <label htmlFor="reason">Чому ви хочете стати організатором? *</label>
                        </div>

                        <div className="input-group">
                            <textarea id="plans" placeholder=" " rows="3" required></textarea>
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