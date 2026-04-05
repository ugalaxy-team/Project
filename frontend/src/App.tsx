import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import { Profile } from "./pages/Profile/Profile";
import { TournamentsPage } from "./pages/TournamentsPage/TournamentsPage";
import { TournamentPage } from "./pages/TournamentPage/TournamentPage";
import { Page404 } from "./pages/Page404/Page404";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import SignOut from "./pages/Auth/SignOut";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import { RoleRequestPage } from "./pages/GetRole/RoleRequestPage";
import {Toaster} from 'react-hot-toast'

export const App = () => {
  return (
    <>
    <Toaster position="top-center"reverseOrder={false}/>
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/auth/" >
            <Route path="sign-in" element={<SignIn />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="sign-out" element={<SignOut />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="/tournament/:id" element={<TournamentPage />} />
          <Route path="/RoleRequestForm" element={<RoleRequestPage/>} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
    </>
  );
};
