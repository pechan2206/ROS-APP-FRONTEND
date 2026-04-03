import { Routes, Route, Navigate } from "react-router-dom";
import NavbarCajero from "../components/NavbarCajero";
import Caja from "../pages/cajero/Caja";
import ReportesCajero from "../pages/cajero/ReportesCajero"; // 👈 NUEVO

export default function CajeroRouter({ setRol }) {
  return (
    <>
      <NavbarCajero nombre="Laura" setRol={setRol} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route index element={<Navigate to="caja" />} />
          <Route path="caja" element={<Caja />} />
          <Route path="reportes" element={<ReportesCajero />} /> {/* 👈 NUEVO */}
          <Route path="*" element={<p className="text-gray-500">Página no encontrada</p>} />
        </Routes>
      </main>
    </>
  );
}