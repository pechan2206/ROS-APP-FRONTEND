import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminRouter from "./AdminRouter";
import MeseroRouter from "./MeseroRouter";
import CocineroRouter from "./CocineroRouter";  // ← AGREGAR ESTA LÍNEA

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
        {/* Public routes */}
        <Route path="/login" element={<Login setRol={setRol} />} />
        <Route path="/register" element={<Register />} />

        {/* No role → send to login */}
        {!rol && <Route path="/*" element={<Navigate to="/login" />} />}

        {/* Admin routes */}
        {rol === "Administrador" && (
          <Route path="/admin/*" element={<AdminRouter setRol={setRol} />} />
        )}

        {/* Mesero routes */}
        {rol === "Mesero" && (
          <Route path="/mesero/*" element={<MeseroRouter setRol={setRol} />} />
          
        )}

        {/* ↓↓↓ AGREGAR ESTAS 4 LÍNEAS ↓↓↓ */}
        {/* Cocinero routes */}
        {rol === "Cocinero" && (
          <Route path="/cocinero/*" element={<CocineroRouter setRol={setRol} />} />
        )}
        {/* ↑↑↑ HASTA AQUÍ ↑↑↑ */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

