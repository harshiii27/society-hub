import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Societies from "./pages/Societies";
import SocietyDetails from "./pages/SocietyDetails";
import Application from "./pages/Application";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyApplications from "./pages/MyApplications";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";


function App() {
  return (
    <BrowserRouter>
      <Navbar title="Society Hub" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/societies" element={<Societies />} />
        <Route path="/societies/:id" element={<SocietyDetails />} />
        <Route path="/apply/:societyId" element={<Application />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;