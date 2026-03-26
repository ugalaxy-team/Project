import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { Home } from "./pages/Home/Home";
import { Profile } from "./pages/Profile/Profile";
import { TournamentsPage } from "./pages/TournamentsPage/TournamentsPage";
import { TournamentPage } from "./pages/TournamentPage/TournamentPage";
import { Page404 } from "./pages/Page404/Page404";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import SignOut from "./pages/Auth/SignOut";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

export const App = () => {
  return (
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
          <Route path="*" element={<Page404 />} />
        </Route>

        {/* Без нього */}
        <Route path="/auth">
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="sign-out" element={<SignOut />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
