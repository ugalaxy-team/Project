import { Link, useNavigate } from 'react-router-dom';

function Page404() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <h1 className="text-9xl font-extrabold text-blue-600 tracking-widest">
                404
            </h1>

            <div className="mt-8">
                <h2 className="text-3xl font-bold text-gray-800 md:text-4xl">
                    Схоже, ви загубилися...
                </h2>
                <p className="text-gray-600 mt-4 text-lg max-w-md mx-auto">
                    Ця сторінка або пішла у відпустку, або її ніколи не існувало.
                    Не хвилюйтеся, ми допоможемо вам повернутися.
                </p>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 font-semibold rounded-lg border-2 border-blue-600 text-white-600 hover:bg-blue-50 transition-colors"
                >
                    Назад
                </button>
                <button className="px-8 py-3 font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                    <Link
                        to="/">
                        На головну
                    </Link>
                </button>
            </div>
        </div>
    );
};

export default Page404;