import { Routes, Route, Navigate } from "react-router-dom";
import NavbarCocinero from "../components/NavbarCocinero";
import Cocina from "../pages/cocinero/Cocinero";

export default function CocineroRouter({ setRol }) {
  return (
    <>
      {/* Navbar del cocinero */}
      <NavbarCocinero nombre="Pedro" setRol={setRol} />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          {/* ❌ ERROR CORREGIDO: Usar path="/" en lugar de index para redirigir la raíz del router anidado */}
          <Route path="/" element={<Navigate to="cocina" />} />
          <Route path="cocina" element={<Cocina />} />
          <Route path="*" element={<p className="text-gray-500">Página no encontrada</p>} />
        </Routes>
      </main>
    </>
  );
}