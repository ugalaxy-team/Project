import { useState } from 'react';
import "./TournamentPage.css";

const tournamentInfo = {
    status: "Активно",
    theme: "Програмування",
    description: "Ваша мета — створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс,",
    requirements: [
        "створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс,",
        "створити ядро аналог лінукс, створити ядро аналог лінукс,",
        "створити ядро аналог лінукс,",
        "створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс,"
    ],
    techStack: {
        limitations: "Жодних обмежень!",
        details: "створити ядро аналог лінукс, створити ядро аналог лінукс, створити ядро аналог лінукс,"
    }
};

function TournamentPage() {
    const [activeTab, setActiveTab] = useState('description');

    return (
        <>
            <header>
                <h3 className="sflu">Star For Life Ukraine</h3>
                <div className="nav-menu">
                    <button>Всі турніри</button>
                    <button>Як долучитися</button>
                    <button>Новини</button>
                </div>
            </header>
            
            <section className="information">
                <div className="status-theme">
                    <div className="status">{tournamentInfo.status}</div>
                    <div className="theme">{tournamentInfo.theme}</div>
                </div>

                <h1 className="tournament-name">Slovo Game Jam</h1>

                <div className="conditions">
                    <div className="condition">
                        <p>12 днів</p>
                        <p>До кінця</p>
                    </div>
                    <div className="condition">
                        <p>Від 3 до 5</p>
                        <p>Учасників в команді</p>
                    </div>
                    <div className="condition">
                        <p>3</p>
                        <p>Призових місць</p>
                    </div>
                </div>

                <div className="control-buttons">
                    <button className="submit">Подати заявку</button>
                    <button className="find-team">Шукаю команду</button>
                </div>
                
                <svg width="100%" height="120px" id="svg" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"
                     className="transition duration-300 ease-in-out delay-150 svg">
                    <path
                        d="M 0,200 L 0,87 C 76.7,80.1 153.4,73.3 225,49 C 296.5,24.6 362.9,-17.2 420,-3 C 477,11.2 524.5,81.6 598,105 C 671.4,128.3 770.6,104.5 839,78 C 907.3,51.4 944.9,22 1006,13 C 1067.0,3.9 1151.7,15.2 1228,31 C 1304.2,46.7 1372.1,66.8 1440,87 L 1440,200 L 0,200 Z"
                        stroke="none" strokeWidth="0" fill="#f9fafc"
                        className="transition-all duration-300 ease-in-out delay-150 path-0"
                        ></path>
                </svg>
            </section>

            <section className="about-tournament">
                <div className="tabs">
                    <button 
                        className={activeTab === 'description' ? 'active' : ''} 
                        onClick={() => setActiveTab('description')}
                    >
                        Опис завдання
                    </button>
                    <button 
                        className={activeTab === 'teams' ? 'active' : ''} 
                        onClick={() => setActiveTab('teams')}
                    >
                        Команди
                    </button>
                    <button 
                        className={activeTab === 'results' ? 'active' : ''} 
                        onClick={() => setActiveTab('results')}
                    >
                        Результати
                    </button>
                    <button 
                        className={activeTab === 'looks-for-team' ? 'active' : ''} 
                        onClick={() => setActiveTab('looks-for-team')}
                    >
                        Шукають команду
                    </button>
                </div>

                {activeTab === 'description' && (
                    <div className="main-information">
                        <h2>Що потрібно зробити?</h2>
                        <p>{tournamentInfo.description}</p>

                        <h2>Ключові вимоги:</h2>
                        <ul>
                            {tournamentInfo.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                            ))}
                        </ul>

                        <h2>Стек технологій:</h2>
                        <p><strong>{tournamentInfo.techStack.limitations}</strong> <br/> {tournamentInfo.techStack.details}</p>
                    </div>
                )}
            </section>
        </>
    )
}

export default TournamentPage;