import { Routes, Route, Navigate } from "react-router-dom";
import NavbarAdmin from "../components/NavbarAdmin";
import Dashboard from "../pages/admin/Dashboard";
import GestionMesas from "../pages/admin/GestionMesas";

export default function AdminRouter() {
  return (
    <>
      {/* 🔹 Navbar persistente en todas las páginas del admin */}
      <NavbarAdmin nombre="Carlos" />

      {/* 🔹 Contenido de cada sección */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          {/* Redirección al dashboard por defecto */}
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mesas" element={<GestionMesas />} />

          {/* ⚠️ Ruta de fallback opcional */}
          <Route
            path="*"
            element={<p className="text-gray-500">Página no encontrada</p>}
          />
        </Routes>
      </main>
    </>
  );
}
