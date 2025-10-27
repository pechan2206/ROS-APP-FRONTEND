import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Home from "../pages/mesero/Home";
import Mesas from "../pages/mesero/Mesas";

export default function MeseroRouter() {
  return (
    <>
      {/* 🔹 Navbar persistente */}
      <Navbar nombre="Juan" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="home" />} />
          <Route path="home" element={<Home />} />
          <Route path="mesas" element={<Mesas />} />
        </Routes>
      </main>

      {/* 🔹 Footer persistente (si lo quieres en todas las vistas) */}
      <Footer />
    </>
  );
}
