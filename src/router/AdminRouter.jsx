import { Routes, Route, Navigate } from "react-router-dom";
import NavbarAdmin from "../components/NavbarAdmin";
import Dashboard from "../pages/admin/DashboardAdmin";
import Reportes from "../pages/admin/Reportes";
import Clientes from "../pages/admin/Clientes";
import Productos from "../pages/admin/Productos";
import Proveedores from "../pages/admin/Proveedores";
import Usuarios from "../pages/admin/Usuarios";

export default function AdminRouter({ setRol }) {   // ← RECIBIR setRol AQUÍ
  return (
    <>
      {/* 🔹 Navbar persistente en todas las páginas del admin */}
      <NavbarAdmin nombre="Carlos" setRol={setRol} />  {/* ← PASARLO AL NAVBAR */}

      {/* 🔹 Contenido de cada sección */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          {/* Redirección al dashboard por defecto */}
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reportes" element={<Reportes />}/>
          <Route path="clientes" element={<Clientes />}/>
          <Route path="productos" element={<Productos />} />
          <Route path="proveedores" element={<Proveedores />} /> 
          <Route path="usuarios" element={<Usuarios />} /> 


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
