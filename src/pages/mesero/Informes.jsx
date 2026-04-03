import { useEffect, useState } from "react";

const BASE = "https://remarkable-grace-production.up.railway.app/api";

const formatCOP = (n) =>
  !n && n !== 0 ? "—" : "$" + Number(n).toLocaleString("es-CO");

const estadoConfig = {
  DISPONIBLE: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  OCUPADA:    { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
  RESERVADA:  { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400"   },
};

const pedidoEstadoConfig = {
  Pendiente:      { bg: "bg-yellow-100", text: "text-yellow-700" },
  En_preparacion: { bg: "bg-orange-100", text: "text-orange-700" },
  Entregado:      { bg: "bg-green-100",  text: "text-green-700"  },
  Pagado:         { bg: "bg-blue-100",   text: "text-blue-700"   },
  Anulado:        { bg: "bg-red-100",    text: "text-red-700"    },
};

export default function Informes() {
  const [mesas,   setMesas]   = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/mesas`).then(r => r.json()),
      fetch(`${BASE}/pedidos`).then(r => r.json()),
    ])
      .then(([m, p]) => { setMesas(m); setPedidos(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hoy         = new Date().toDateString();
  const pedidosHoy  = pedidos.filter(p => p.fecha && new Date(p.fecha).toDateString() === hoy);
  const pendientes  = pedidos.filter(p => p.estado === "Pendiente" || p.estado === "En_preparacion");
  const totalHoy    = pedidosHoy.reduce((a, p) => a + (p.total || 0), 0);
  const disponibles = mesas.filter(m => m.estado?.toUpperCase() === "DISPONIBLE").length;
  const ocupadas    = mesas.filter(m => m.estado?.toUpperCase() === "OCUPADA").length;
  const reservadas  = mesas.filter(m => m.estado?.toUpperCase() === "RESERVADA").length;

  const metrics = [
    { label: "Mesas disponibles", value: loading ? "—" : disponibles,        color: "text-emerald-600" },
    { label: "Mesas ocupadas",    value: loading ? "—" : ocupadas,            color: "text-red-600"     },
    { label: "Pedidos hoy",       value: loading ? "—" : pedidosHoy.length,   color: "text-blue-600"    },
    { label: "Pendientes ahora",  value: loading ? "—" : pendientes.length,   color: "text-amber-600"   },
  ];

  return (
    <div className="max-w-5xl mx-auto">  {/* ← sin Navbar, sin Footer, sin bg-gray-100 */}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Informes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Resumen del día — {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">{m.label}</p>
            <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* Estado de mesas */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">Estado actual de mesas</h2>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
          ) : (
            <>
              <div className="flex rounded-xl overflow-hidden h-3 mb-4 bg-gray-100">
                {disponibles > 0 && <div className="bg-emerald-400" style={{ width: `${(disponibles / mesas.length) * 100}%` }} />}
                {ocupadas    > 0 && <div className="bg-red-400"     style={{ width: `${(ocupadas    / mesas.length) * 100}%` }} />}
                {reservadas  > 0 && <div className="bg-amber-400"   style={{ width: `${(reservadas  / mesas.length) * 100}%` }} />}
              </div>
              <div className="flex flex-col divide-y divide-gray-50">
                {mesas.map(m => {
                  const cfg = estadoConfig[m.estado?.toUpperCase()] || estadoConfig.DISPONIBLE;
                  return (
                    <div key={m.idMesa} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className="text-sm font-medium text-gray-800">Mesa {m.numero}</span>
                        <span className="text-xs text-gray-400">{m.capacidad} pers.</span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {m.estado}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Disponible ({disponibles})</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-red-400" /> Ocupada ({ocupadas})</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-amber-400" /> Reservada ({reservadas})</span>
              </div>
            </>
          )}
        </div>

        {/* Ventas del día */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">Ventas del día</h2>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Total recaudado hoy</p>
                <p className="text-3xl font-bold text-gray-800">{formatCOP(totalHoy)}</p>
                <p className="text-xs text-gray-400 mt-1">{pedidosHoy.length} pedidos</p>
              </div>
              <div className="flex flex-col divide-y divide-gray-50">
                {pedidosHoy.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sin pedidos hoy</p>
                ) : pedidosHoy.slice(0, 6).map(p => {
                  const cfg = pedidoEstadoConfig[p.estado] || { bg: "bg-gray-100", text: "text-gray-600" };
                  return (
                    <div key={p.idPedido} className="flex items-center justify-between py-2.5">
                      <div>
                        <span className="text-sm font-medium text-gray-800">#{p.idPedido}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {p.tipo === "Mesa" ? `Mesa ${p.mesa?.numero ?? "?"}` : p.tipo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {p.estado?.replace("_", " ")}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">{formatCOP(p.total)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pedidos pendientes */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-500 mb-4">Pedidos pendientes ahora</h2>
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
        ) : pendientes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Sin pedidos pendientes 🎉</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {pendientes.map(p => {
              const cfg = pedidoEstadoConfig[p.estado] || { bg: "bg-gray-100", text: "text-gray-600" };
              return (
                <div key={p.idPedido} className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-800">Pedido #{p.idPedido}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {p.tipo === "Mesa" ? `Mesa ${p.mesa?.numero ?? "?"}` : p.tipo}
                    </span>
                    {p.cliente?.nombre && (
                      <span className="text-xs text-gray-400 ml-2">· {p.cliente.nombre}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {p.estado?.replace("_", " ")}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{formatCOP(p.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}