import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import AdminRouter from "./AdminRouter";
import MeseroRouter from "./MeseroRouter";

export default function AppRouter() {
  const rol = localStorage.getItem("rol");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {rol === "admin" ? (
          <Route path="/admin/*" element={<AdminRouter />} />
        ) : (
          <Route path="/mesero/*" element={<MeseroRouter />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
