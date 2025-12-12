import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pedidos from "../pages/mesero/Pedidos";
import Mesas from "../pages/mesero/Mesas";
import Home from "../pages/mesero/Home";
import Platos from "../pages/mesero/Platos";
import DetallesPedido from "../pages/mesero/DetallesPedido";
import CrearCliente from "../pages/mesero/CrearCliente";

export default function MeseroRouter() {
  return (
    <>
      <Navbar nombre="Juan" />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>

          {/* 👈 ESTA ES LA RUTA QUE HACE QUE APAREZCA HOME */}
          <Route index element={<Navigate to="home" replace />} />

          {/* Rutas internas */}
          <Route path="home" element={<Home />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="mesas" element={<Mesas />} />
          <Route path="pedidos/:id/platos" element={<Platos />} />    // Platos de un pedido
          <Route path="pedidos/detalles/:id" element={<DetallesPedido />} />
          <Route path="crear-cliente" element= {<CrearCliente />} />

        </Routes>
      </main>
      <Footer />
    </>
  );
}
