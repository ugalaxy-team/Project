import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home/Home.tsx"
import TournamentsPage from "./pages/TournamentsPage/TournamentsPage.tsx";
import TournamentPage from "./pages/TournamentPage/TournamentPage.tsx";
import Profile from "./pages/Profile/Profile.tsx";
import Login from "./pages/Login/Login.tsx";
import Register from "./pages/Register/Register.tsx";

function App() {
  return(
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/tournament/:tournament_id" element={<TournamentPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App
