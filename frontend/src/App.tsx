import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home/Home.tsx"
import TournamentsPage from "./pages/TournamentsPage/TournamentsPage.tsx";
import TournamentPage from "./pages/TournamentPage/TournamentPage.tsx";
import Profile from "./pages/Profile/Profile.tsx";
import Auth from "./pages/Auth/Auth.tsx";
import Page404 from "./pages/Page404/Page404.tsx";

function App() {
  return(
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/tournament/:tournament_id" element={<TournamentPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Page404 />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App
