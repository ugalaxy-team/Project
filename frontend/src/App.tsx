import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io, Socket } from "socket.io-client";
import { onIdTokenChanged } from "firebase/auth";

// Firebase та Хуки
import { auth } from "./firebase";
import { useNotificationsSocket } from "./hooks/useNotificationsSocket";

// Лейаути та Захист
import { MainLayout } from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// Сторінки (Основні)
import { Home } from "./pages/Home/Home";
import { Profile } from "./pages/Profile/Profile";
import { TournamentsPage } from "./pages/TournamentsPage/TournamentsPage";
import { TournamentPage } from "./pages/TournamentPage/TournamentPage";
import { RoleRequestPage } from "./pages/GetRole/RoleRequestPage";
import { RegistrationPage } from "./pages/RegistrationPage/RegistrationPage";

// Сторінки (Інфо)
import { ContactPage } from "./pages/Contact/Contact";
import { AboutUs } from "./pages/AboutUs/AboutUs";
import { SupportPage } from "./pages/SupportPage/SupportPage";
import { FaqPage } from "./pages/FaqPage/FaqPage";
import { RulesPage } from "./pages/Rules/Rules";
import { Page404 } from "./pages/Page404/Page404";

// Сторінки (Авторизація)
import { AuthPage } from "./pages/Auth/AuthPage";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import SignOut from "./pages/Auth/SignOut";

// ─── Компонент для скидання скролу ───
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App = () => {
  const { t } = useTranslation("common");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toastTheme, setToastTheme] = useState<"colored" | "dark">("colored");

  // ─── Динамічна тема додатку та тостів ───
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      const isDark =
        savedTheme === "dark" || (!savedTheme && mediaQuery.matches);

      if (isDark) {
        document.documentElement.classList.add("dark");
        setToastTheme("dark");
      } else {
        document.documentElement.classList.remove("dark");
        setToastTheme("colored");
      }
    };

    // 1. Встановлюємо при старті та зміні системи
    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);

    // 2. Слідкуємо за ручним перемиканням через ThemeToggle
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setToastTheme(isDark ? "dark" : "colored");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
      observer.disconnect();
    };
  }, []);

  // ─── Сокети та Firebase Auth ───
  useEffect(() => {
    let currentSocket: Socket | null = null;

    const unsubscribeAuth = onIdTokenChanged(auth, async (user) => {
      if (currentSocket) {
        currentSocket.disconnect();
        setSocket(null);
      }

      if (user) {
        const token = await user.getIdToken();
        currentSocket = io(import.meta.env.VITE_SOCKETIO_SERVER_URL, {
          auth: { token },
        });

        currentSocket.on("connect_error", () => {
          toast.error(
            t(
              "errors.socket",
              "Проблеми з сервером :(. Сповіщення тимчасово не працюють",
            ),
            { toastId: "socket-error" },
          );
        });

        currentSocket.on("connect", () => {
          toast.dismiss("socket-error");
        });

        setSocket(currentSocket);
      }
    });

    return () => {
      unsubscribeAuth();
      if (currentSocket) {
        currentSocket.disconnect();
      }
    };
  }, [t]);

  useNotificationsSocket(socket);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={toastTheme}
      />

      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/tournament/:id" element={<TournamentPage />} />
            <Route
              path="/role-request-form"
              element={
                <ProtectedRoute>
                  <RoleRequestPage />
                </ProtectedRoute>
              }
            />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="*" element={<Page404 />} />
          </Route>

          <Route path="/auth/">
            <Route index element={<AuthPage />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="sign-out" element={<SignOut />} />
          </Route>

          <Route
            path="/tournament/:id/register"
            element={
              <ProtectedRoute>
                <RegistrationPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};
