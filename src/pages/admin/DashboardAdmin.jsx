import { useState, useEffect } from "react";
import { 
  PaperAirplaneIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { pedidoService } from "../../services/pedidoService";
import { ingresoService } from "../../services/ingresoService";
import { mesaService } from "../../services/mesaService";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const SweetAlert = withReactContent(Swal);

  // Estados para métricas
  const [metricas, setMetricas] = useState({
    totalPedidosHoy: 0,
    totalIngresosHoy: 0,
    pedidosPendientes: 0,
    mesasOcupadas: 0,
    pedidosEntregados: 0,
    pedidosCancelados: 0,
  });
  const [loading, setLoading] = useState(true);

  // Estados para correos
  const [destino, setDestino] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [asuntoMasivo, setAsuntoMasivo] = useState("");
  const [mensajeMasivo, setMensajeMasivo] = useState("");
  const [mostrarCorreos, setMostrarCorreos] = useState(false);

  // Cargar métricas del sistema
  const cargarMetricas = async () => {
    try {
      setLoading(true);
      const hoy = new Date().toISOString().split("T")[0];

      const [pedidos, ingresos, mesas] = await Promise.all([
        pedidoService.listar(),
        ingresoService.listar(),
        mesaService.listar(),
      ]);

      // Calcular métricas
      const pedidosHoy = pedidos.filter((p) => {
        const fechaPedido = new Date(p.fecha).toISOString().split("T")[0];
        return fechaPedido === hoy;
      });

      const ingresosHoy = ingresos.filter((i) => i.fecha === hoy);
      const totalIngresos = ingresosHoy.reduce((sum, i) => sum + i.monto, 0);

      setMetricas({
        totalPedidosHoy: pedidosHoy.length,
        totalIngresosHoy: totalIngresos,
        pedidosPendientes: pedidos.filter((p) => p.estado === "Pendiente").length,
        mesasOcupadas: mesas.filter((m) => m.estado === "Ocupada").length,
        pedidosEntregados: pedidos.filter((p) => p.estado === "Entregado").length,
        pedidosCancelados: pedidos.filter((p) => p.estado === "Cancelado").length,
      });
    } catch (error) {
      console.error("Error al cargar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarMetricas, 30000);
    return () => clearInterval(interval);
  }, []);

  // Validación de correo
  const esCorreoValido = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Enviar correo manual
  const enviarCorreo = async () => {
    if (!destino || !asunto || !mensaje) {
      return SweetAlert.fire("Error", "Todos los campos son obligatorios", "warning");
    }

    if (!esCorreoValido(destino)) {
      return SweetAlert.fire("Error", "Debes ingresar un correo válido", "warning");
    }

    try {
      const res = await fetch("https://remarkable-grace-production.up.railway.app/api/email/enviar-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destino, asunto, mensaje }),
      });

      if (res.ok) {
        SweetAlert.fire("Envío correo", "Correo enviado correctamente", "success");
        setDestino("");
        setAsunto("");
        setMensaje("");
      } else {
        SweetAlert.fire("Error", "No se pudo enviar el correo", "error");
      }
    } catch (error) {
      console.error(error);
      SweetAlert.fire("Error", "Error de conexión con el servidor", "warning");
    }
  };

  // Enviar correo masivo
  const enviarCorreoMasivo = async () => {
    if (!asuntoMasivo || !mensajeMasivo) {
      return SweetAlert.fire("Error", "Todos los campos son obligatorios", "warning");
    }

    try {
      const res = await fetch("https://remarkable-grace-production.up.railway.app/api/email/enviar-a-usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asunto: asuntoMasivo, mensaje: mensajeMasivo }),
      });

      if (res.ok) {
        SweetAlert.fire("Envío correo masivo", "Correos enviados a todos los usuarios", "success");
        setAsuntoMasivo("");
        setMensajeMasivo("");
      } else {
        SweetAlert.fire("Error", "No se pudo enviar el correo masivo", "error");
      }
    } catch (error) {
      console.error(error);
      SweetAlert.fire("Error", "Error de conexión con el servidor", "warning");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard Administrativo</h2>
          <p className="text-gray-500 text-sm mt-1">Vista general del sistema</p>
        </div>
        <button
          onClick={() => setMostrarCorreos(!mostrarCorreos)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {mostrarCorreos ? "Ver Métricas" : "Enviar Correos"}
        </button>
      </div>

      {!mostrarCorreos ? (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Pedidos de hoy */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Pedidos Hoy</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {metricas.totalPedidosHoy}
                  </p>
                </div>
                <ShoppingCartIcon className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            {/* Ingresos de hoy */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Ingresos Hoy</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    ${metricas.totalIngresosHoy.toLocaleString("es-CO")}
                  </p>
                </div>
                <CurrencyDollarIcon className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>

            {/* Pedidos pendientes */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {metricas.pedidosPendientes}
                  </p>
                </div>
                <ClockIcon className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </div>

            {/* Mesas ocupadas */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Mesas Ocupadas</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {metricas.mesasOcupadas}
                  </p>
                </div>
                <UserGroupIcon className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Estado de pedidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Pedidos entregados */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Pedidos Entregados</h3>
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-4xl font-bold text-green-600">
                {metricas.pedidosEntregados}
              </p>
            </div>

            {/* Pedidos cancelados */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Pedidos Cancelados</h3>
                <XCircleIcon className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-4xl font-bold text-red-600">
                {metricas.pedidosCancelados}
              </p>
            </div>
          </div>

        </>
      ) : (
        <>
          {/* Sección de correos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correo manual */}
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Enviar correo manual
              </h3>

              <input
                type="email"
                placeholder="Correo destino"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Asunto"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-3 h-24 focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={enviarCorreo}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                Enviar correo
              </button>
            </div>

            {/* Correo masivo */}
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Enviar correo a todos los usuarios
              </h3>

              <input
                type="text"
                placeholder="Asunto"
                value={asuntoMasivo}
                onChange={(e) => setAsuntoMasivo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-green-500"
              />

              <textarea
                placeholder="Mensaje"
                value={mensajeMasivo}
                onChange={(e) => setMensajeMasivo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-3 h-24 focus:ring-2 focus:ring-green-500"
              />

              <button
                onClick={enviarCorreoMasivo}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-green-700 transition-all"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                Enviar a todos
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}