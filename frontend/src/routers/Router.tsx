import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { Home } from "@/pages/Home/Home";
import { Profile } from "@/pages/Profile/Profile";
import { TournamentsPage } from "@/pages/TournamentsPage/TournamentsPage";
import { TournamentPage } from "@/pages/TournamentPage/TournamentPage";
import { Page404 } from "@/pages/Page404/Page404";
import { ContactPage } from "@/pages/Contact/Contact";
import { AboutUs } from "@/pages/AboutUs/AboutUs";
import { SupportPage } from "@/pages/SupportPage/SupportPage";
import { FaqPage } from "@/pages/FaqPage/FaqPage";
import { RulesPage } from "@/pages/Rules/Rules";
import ProtectedRoute from "@/routers/ProtectedRoute/ProtectedRoute";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import { RoleRequestPage } from "@/pages/GetRole/RoleRequestPage";
import { AuthPage } from "@/pages/Auth/AuthPage";
import SignOut from "@/pages/Auth/SignOut";
import { OrganizerPanel } from "@/pages/OrganizerPanel/OrganizerPanel";
import JuryPanel from "@/pages/JuryPanel/JuryPanel";
import EvaluateTournamentPage from "@/pages/JuryPanel/EvaluateTournamentPage";
import { NewsPage } from "@/pages/NewsPage/NewsPage";
import { RegistrationPage } from "@/pages/RegistrationPage/RegistrationPage";


export const Router = () => {
  return (
    <BrowserRouter>
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
            path="/tournament/:id/register"
            element={
              <ProtectedRoute>
                <RegistrationPage />
              </ProtectedRoute>
            }
          />

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
          <Route path="/jury-panel">
            <Route
              index
              element={
                <ProtectedRoute>
                  <JuryPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="evaluate/:id"
              element={
                <ProtectedRoute>
                  <EvaluateTournamentPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/organizer-panel" element={<OrganizerPanel />} />
          <Route
            path="/jury-panel"
            element={
              <ProtectedRoute>
                <JuryPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jury-panel/evaluate/:id"
            element={
              <ProtectedRoute>
                <EvaluateTournamentPage />
              </ProtectedRoute>
            }
          />
          <Route path="/news" element={<NewsPage />} />
          <Route path="*" element={<Page404 />} />
        </Route>
        <Route path="/auth/">
          <Route index element={<AuthPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="sign-out" element={<SignOut />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
