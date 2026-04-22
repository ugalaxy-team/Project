import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { Home } from "./pages/Home/Home";
import { Profile } from "./pages/Profile/Profile";
import { TournamentsPage } from "./pages/TournamentsPage/TournamentsPage";
import { TournamentPage } from "./pages/TournamentPage/TournamentPage";
import { Page404 } from "./pages/Page404/Page404";
import { ContactPage } from "./pages/Contact/Contact";
import { AboutUs } from "./pages/AboutUs/AboutUs";
import { SupportPage } from "./pages/SupportPage/SupportPage";
import { FaqPage } from "./pages/FaqPage/FaqPage";
import { RulesPage } from "./pages/Rules/Rules";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import { RoleRequestPage } from "./pages/GetRole/RoleRequestPage";
import { Toaster, toast } from "react-hot-toast";
import { AuthPage } from "./pages/Auth/AuthPage";
import SignOut from "./pages/Auth/SignOut";
import { useNotificationsSocket } from "./hooks/useNotificationsSocket";
import { io, Socket } from "socket.io-client";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

// Імпорт нашої нової сторінки
import { RegPage } from "./pages/RegistrationPage/RegCommand";

// Утиліта для скролу нагору при кожній зміні URL
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let currentSocket: Socket | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        currentSocket = io(import.meta.env.VITE_SOCKETIO_SERVER_URL, {
          auth: { token },
        });
        currentSocket.on("connect_error", () => {
          toast.error(
            "Проблеми з сервером :(. Сповіщення тимчасово не працюють",
            { id: "socket-error" },
          );
        });
        currentSocket.on("connect", () => {
          toast.dismiss("socket-error");
        });

        setSocket(currentSocket);
      } else {
        if (currentSocket) {
          currentSocket.disconnect();
          setSocket(null);
        }
      }
    });
    return () => {
      unsubscribeAuth();
      if (currentSocket) {
        currentSocket.disconnect();
      }
    };
  }, []);
  useNotificationsSocket(socket);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Сторінки з Хедером та Футером */}
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

          {/* Самостійні сторінки без MainLayout (на весь екран) */}
          <Route path="/auth/">
            <Route index element={<AuthPage />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="sign-out" element={<SignOut />} />
          </Route>

          {/* СТОРІНКА РЕЄСТРАЦІЇ НА ТУРНІР */}
          <Route
            path="/tournament/:id/register"
            element={
              <ProtectedRoute>
                <RegPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};
