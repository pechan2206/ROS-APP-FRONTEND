import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminRouter from "./AdminRouter";
import MeseroRouter from "./MeseroRouter";

export default function AppRouter() {
  const [rol, setRol] = useState(localStorage.getItem("rol"));

  useEffect(() => {
    const handleStorageChange = () => {
      setRol(localStorage.getItem("rol"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter key={rol || "no-rol"}>
      <Routes>
        {/* 🟢 Login y registro */}
        <Route path="/login" element={<Login setRol={setRol} />} />
        <Route path="/register" element={<Register />} />

        {/* 🟡 Sin rol: redirige al login */}
        {!rol && <Route path="/*" element={<Navigate to="/login" />} />}

        {/* 🔵 Rutas por rol */}
        {rol === "admin" && (
          <Route path="/admin/*" element={<AdminRouter setRol={setRol} />} />
        )}
        {rol === "mesero" && (
          <Route path="/mesero/*" element={<MeseroRouter setRol={setRol} />} />
        )}

        {/* 🔴 Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
