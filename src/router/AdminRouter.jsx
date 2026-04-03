import { Routes, Route, Navigate } from "react-router-dom";
import NavbarAdmin from "../components/NavbarAdmin";
import Dashboard from "../pages/admin/DashboardAdmin";
import Reportes from "../pages/admin/Reportes";
import Clientes from "../pages/admin/Clientes";
import Productos from "../pages/admin/Productos";
import Proveedores from "../pages/admin/Proveedores";
import Usuarios from "../pages/admin/Usuarios";
import PerfilPage from "../components/PerfilPage";

export default function AdminRouter({ setRol }) {
  const nombre = localStorage.getItem("nombre") || "Carlos";

  return (
    <>
      <NavbarAdmin nombre={nombre} setRol={setRol} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="productos" element={<Productos />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="perfil" element={<PerfilPage nombre={nombre} rol="admin" rutaInicio="/admin/dashboard" />} />
          <Route path="*" element={<p className="text-gray-500">Página no encontrada</p>} />
        </Routes>
      </main>
    </>
  );
}