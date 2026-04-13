import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ForgotPassword from "./pages/Auth/ForgotPassword";
import { RoleRequestPage } from "./pages/GetRole/RoleRequestPage";
import { Toaster } from 'react-hot-toast';
import { AuthPage } from "./pages/Auth/AuthPage";
import SignOut from "./pages/Auth/SignOut";
import { useNotificationsSocket } from "./hooks/useNotificationsSocket";
import { io, Socket } from 'socket.io-client';
import { auth } from "./firebase";
import { useEffect, useState } from "react";

export const App = () => {
  const [socket, setSocket] = useState<Socket>();
  useEffect(() => {
    const initSocket = async () => {
      const token = await auth.currentUser?.getIdToken();
      console.log(token)
      if (token) {
        const s = io(import.meta.env.VITE_SOCKETIO_SERVER_URL, {
          auth: { token }
        });

        setSocket(s);

        return () => {
          s.disconnect();
        };
      }
    };

    initSocket();
  }, []);
  useNotificationsSocket(socket);

  if (!socket) {
    return <div>Connecting to notifications...</div>;
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
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
            <Route path="/role-request-form" element={
              <ProtectedRoute>
                <RoleRequestPage />
              </ProtectedRoute>
            } />
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
        </Routes>
      </BrowserRouter>
    </>
  );
};