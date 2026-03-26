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
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import SignOut from "./pages/Auth/SignOut";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import { RoleRequestPage } from "./pages/GetRole/RoleRequestPage";
import { Toaster } from 'react-hot-toast';

export const App = () => {
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
            <Route path="/RoleRequestForm" element={<RoleRequestPage/>} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="*" element={<Page404 />} />
          </Route>

          <Route path="/auth">
            <Route path="sign-in" element={<SignIn />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="sign-out" element={<SignOut />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};