import { useEffect, useState } from "react";

const BASE = "https://remarkable-grace-production.up.railway.app/api";

const estadoBadge = {
  DISPONIBLE: "bg-green-100 text-green-700",
  OCUPADA:    "bg-red-100 text-red-700",
  RESERVADA:  "bg-yellow-100 text-yellow-700",
};

const formatHora = () => {
  const h = new Date().getHours();
  const turno = h < 12 ? "Turno de la mañana" : h < 17 ? "Turno de la tarde" : "Turno de la noche";
  const fecha = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  return `${turno} · ${fecha}`;
};

export default function Home() {
  const [mesas, setMesas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/mesas`).then(r => r.json()),
      fetch(`${BASE}/pedidos`).then(r => r.json()),
    ])
      .then(([m, p]) => { 
        setMesas(m); 
        setPedidos(p); 
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ✅ MISMA LÓGICA DEL ADMIN
  const hoy = new Date().toISOString().split("T")[0];

  const pedidosHoy = pedidos.filter(p => {
    if (!p.fecha) return false;
    const fechaPedido = new Date(p.fecha).toISOString().split("T")[0];
    return fechaPedido === hoy;
  }).length;

  const ocupadas = mesas.filter(m => m.estado?.toUpperCase() === "OCUPADA").length;

  const pendientes = pedidos.filter(
    p => p.estado === "Pendiente" || p.estado === "En_preparacion"
  );

  const metrics = [
    { label: "Mesas activas", value: loading ? "—" : ocupadas },
    { label: "Pedidos hoy", value: loading ? "—" : pedidosHoy },
    { label: "Pendientes", value: loading ? "—" : pendientes.length },
  ];

  const acciones = [
    { label: "Nuevo pedido", desc: "Mesa, domicilio o para llevar", href: "/mesero/pedidos", color: "bg-blue-50 text-blue-600" },
    { label: "Ver mesas", desc: "Estado del salón en tiempo real", href: "/mesero/mesas", color: "bg-green-50 text-green-600" },
    { label: "Informes", desc: "Ventas y pedidos del día", href: "/mesero/Informes", color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Saludo */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-1">{formatHora()}</p>
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, mesero</h1>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {metrics.map(m => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{m.label}</p>
            <p className="text-2xl font-semibold text-gray-800">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Acciones */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-medium mb-3">Acceso rápido</p>
          <div className="flex flex-col gap-2">
            {acciones.map(a => (
              <a key={a.label} href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${a.color}`}>→</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{a.label}</p>
                  <p className="text-xs text-gray-400">{a.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Estado mesas */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-medium mb-3">Estado de mesas</p>
          <div className="flex flex-col divide-y divide-gray-50">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-4">Cargando...</p>
            ) : (
              mesas.slice(0, 6).map(m => (
                <div key={m.idMesa} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium text-gray-800">Mesa {m.numero}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{m.capacidad} pers.</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${estadoBadge[m.estado?.toUpperCase()] || "bg-gray-100 text-gray-500"}`}>
                      {m.estado}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pedidos pendientes */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-gray-400 font-medium mb-3">Pedidos pendientes ahora</p>
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">Cargando...</p>
        ) : pendientes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Sin pedidos pendientes</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {pendientes.slice(0, 5).map(p => (
              <div key={p.idPedido} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="text-sm font-semibold text-gray-800">Pedido #{p.idPedido}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {p.tipo === "Mesa" ? `Mesa ${p.mesa?.numero ?? "?"}` : p.tipo}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full
                  ${p.estado === "Pendiente"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"}`}>
                  {p.estado?.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}