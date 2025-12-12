import { Routes, Route, Navigate } from "react-router-dom";
import NavbarCajero from "../components/NavbarCajero";
import Caja from "../pages/cajero/Caja";

export default function CajeroRouter({ setRol }) {
  return (
    <>
      {/* Navbar del cajero */}
      <NavbarCajero nombre="Laura" setRol={setRol} />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route index element={<Navigate to="caja" />} />
          <Route path="caja" element={<Caja />} />
          <Route path="*" element={<p className="text-gray-500">Página no encontrada</p>} />
        </Routes>
      </main>
    </>
  );
}