import { Routes, Route, Navigate } from "react-router-dom";
import NavbarCocinero from "../components/NavbarCocinero";
import Cocina from "../pages/cocinero/Cocinero";
import PerfilPage from "../components/PerfilPage";

export default function CocineroRouter({ setRol }) {
  const nombre = localStorage.getItem("nombre") || "Pedro";

  return (
    <>
      <NavbarCocinero nombre={nombre} setRol={setRol} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="cocina" />} />
          <Route path="cocina" element={<Cocina />} />
          <Route path="perfil" element={<PerfilPage nombre={nombre} rol="cocinero" rutaInicio="/cocinero/cocina" />} />
          <Route path="*" element={<p className="text-gray-500">Página no encontrada</p>} />
        </Routes>
      </main>
    </>
  );
}