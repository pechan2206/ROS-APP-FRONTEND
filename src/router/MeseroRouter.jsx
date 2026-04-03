import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pedidos from "../pages/mesero/Pedidos";
import Mesas from "../pages/mesero/Mesas";
import Home from "../pages/mesero/Home";
import Platos from "../pages/mesero/Platos";
import DetallesPedido from "../pages/mesero/DetallesPedido";
import CrearCliente from "../pages/mesero/CrearCliente";
import Informes from "../pages/mesero/Informes";
import PerfilPage from "../components/PerfilPage";

export default function MeseroRouter() {
  const nombre = localStorage.getItem("nombre") || "Juan";

  return (
    <>
      <Navbar nombre={nombre} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="mesas" element={<Mesas />} />
          <Route path="pedidos/:id/platos" element={<Platos />} />
          <Route path="pedidos/detalles/:id" element={<DetallesPedido />} />
          <Route path="crear-cliente" element={<CrearCliente />} />
          <Route path="informes" element={<Informes />} />
          <Route path="perfil" element={<PerfilPage nombre={nombre} rol="mesero" rutaInicio="/mesero/home" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}