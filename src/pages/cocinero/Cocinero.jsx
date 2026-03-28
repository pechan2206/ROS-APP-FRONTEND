// Cocina.jsx — Vista de cocina
// Enfocado en lo que se tiene que preparar: platos + cantidad

import { useEffect, useState } from "react";
import { pedidoService } from "../../services/pedidoService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// ── Config de estados ──────────────────────────────────────────────────────
const ESTADO_CFG = {
  Pendiente:      { bar: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-800 border-yellow-300", btnActive: "bg-yellow-500 text-white border-yellow-500", btnInactive: "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100" },
  En_preparacion: { bar: "bg-blue-500",   badge: "bg-blue-50   text-blue-800   border-blue-300",   btnActive: "bg-blue-600   text-white border-blue-600",   btnInactive: "bg-blue-50   text-blue-700   border-blue-300   hover:bg-blue-100"   },
  Entregado:      { bar: "bg-green-500",  badge: "bg-green-50  text-green-800  border-green-300",  btnActive: "bg-green-600  text-white border-green-600",  btnInactive: "bg-green-50  text-green-700  border-green-300  hover:bg-green-100"  },
  Anulado:        { bar: "bg-red-500",    badge: "bg-red-50    text-red-800    border-red-300",    btnActive: "bg-red-600    text-white border-red-600",    btnInactive: "bg-red-50    text-red-700    border-red-300    hover:bg-red-100"     },
};

const TIPO_CHIP = { Mesa: "bg-blue-500", Llevar: "bg-green-500", Domicilio: "bg-purple-500" };

// ── Tarjeta ────────────────────────────────────────────────────────────────
function CocinaCard({ pedido, onIniciar, onEntregar }) {
  const estadoCfg = ESTADO_CFG[pedido.estado] || { bar: "bg-gray-400", badge: "bg-gray-50 text-gray-600 border-gray-300" };
  const tipoChip  = TIPO_CHIP[pedido.tipo] || "bg-gray-400";
  const platos    = pedido.detallePedidos ?? pedido.detalles ?? [];

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200">

      {/* Barra de estado */}
      <div className={`h-1.5 w-full ${estadoCfg.bar}`} />

      {/* Header */}
      <div className="px-4 pt-3 pb-3 flex items-center justify-between gap-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">#</span>
          <h3 className="text-xl font-bold text-gray-800">{pedido.idPedido}</h3>
          {pedido.tipo === "Mesa" && pedido.mesa?.numero && (
            <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2 py-0.5">
              Mesa {pedido.mesa.numero}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full text-white ${tipoChip}`}>
            {pedido.tipo}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${estadoCfg.badge}`}>
            {pedido.estado.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Platos — protagonista */}
      <div className="px-4 py-3 flex-1">
        {platos.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-4">Sin platos registrados</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {platos.map((d, i) => (
              <li
                key={d.idDetallePedido ?? i}
                className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5"
              >
                <span className="text-sm font-semibold text-gray-800 leading-tight">
                  {d.plato?.nombre ?? "Plato"}
                </span>
                <span className="shrink-0 inline-flex items-center justify-center min-w-[2rem] h-7 text-sm font-bold bg-white border-2 border-gray-200 text-gray-700 rounded-full px-2">
                  x{d.cantidad}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Acción */}
      {pedido.estado === "Pendiente" && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <button
            onClick={() => onIniciar(pedido)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-xl transition shadow-sm"
          >
            Iniciar preparacion
          </button>
        </div>
      )}
      {pedido.estado === "En_preparacion" && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <button
            onClick={() => onEntregar(pedido)}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-bold rounded-xl transition shadow-sm"
          >
            Listo — Marcar entregado
          </button>
        </div>
      )}
    </div>
  );
}

// ── Filtro pill ────────────────────────────────────────────────────────────
function FilterBtn({ label, count, activo, cfgActive, cfgInactive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border transition ${activo ? cfgActive : cfgInactive}`}
    >
      {label}
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activo ? "bg-white/25 text-white" : "bg-white/60 opacity-80"}`}>
        {count}
      </span>
    </button>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────
export default function Cocina() {
  const [pedidos,      setPedidos]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const SweetAlert = withReactContent(Swal);

  const cargarPedidos = async (mostrarAlert = false) => {
    setRefreshing(true);
    try {
      const data = await pedidoService.listar();
      const permitidos = ["Pendiente", "En_preparacion", "Entregado", "Anulado"];
      setPedidos(data.filter(p => permitidos.includes(p.estado)));
      if (mostrarAlert)
        SweetAlert.fire({ icon: "success", title: "Actualizado", timer: 1000, showConfirmButton: false });
    } catch {
      SweetAlert.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los pedidos." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(() => cargarPedidos(), 30000);
    return () => clearInterval(interval);
  }, []);

  const filtrados = filtroEstado ? pedidos.filter(p => p.estado === filtroEstado) : pedidos;
  const cnt = (key) => pedidos.filter(p => p.estado === key).length;

  const cambiarEstado = async (pedido, nuevoEstado) => {
    try {
      await pedidoService.actualizar(pedido.idPedido, { ...pedido, estado: nuevoEstado });
      cargarPedidos();
    } catch {
      SweetAlert.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el pedido." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
          Cargando pedidos…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Vista</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Cocina</h1>
        </div>
        <button
          onClick={() => cargarPedidos(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-60"
        >
          <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pendientes",     key: "Pendiente",      color: "border-l-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "En preparación", key: "En_preparacion", color: "border-l-blue-400",   text: "text-blue-700",   bg: "bg-blue-50"   },
          { label: "Entregados",     key: "Entregado",      color: "border-l-green-400",  text: "text-green-700",  bg: "bg-green-50"  },
          { label: "Cancelados",     key: "Anulado",        color: "border-l-red-400",    text: "text-red-700",    bg: "bg-red-50"    },
        ].map(({ label, key, color, text, bg }) => (
          <div key={key} className={`${bg} border-l-4 ${color} rounded-xl px-4 py-3 cursor-pointer`} onClick={() => setFiltroEstado(filtroEstado === key ? "" : key)}>
            <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
            <p className={`text-2xl font-bold ${text}`}>{cnt(key)}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-2">
        <FilterBtn
          label="Todos" count={pedidos.length}
          activo={filtroEstado === ""}
          cfgActive="bg-gray-700 text-white border-gray-700"
          cfgInactive="bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          onClick={() => setFiltroEstado("")}
        />
        {Object.entries(ESTADO_CFG).map(([key, cfg]) => (
          <FilterBtn
            key={key}
            label={key.replace("_", " ")}
            count={cnt(key)}
            activo={filtroEstado === key}
            cfgActive={cfg.btnActive}
            cfgInactive={cfg.btnInactive}
            onClick={() => setFiltroEstado(filtroEstado === key ? "" : key)}
          />
        ))}
      </div>

      {/* Contador */}
      <div className="flex items-center justify-between mt-3 mb-4">
        <span className="text-sm font-semibold text-gray-600">
          {filtrados.length} de {pedidos.length} pedidos
          {filtroEstado && <span className="text-gray-400 font-normal"> — {filtroEstado.replace("_", " ")}</span>}
        </span>
        <span className="text-xs text-gray-400">Actualiza cada 30s</span>
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <div className="text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-lg font-semibold text-gray-600 mb-1">Sin pedidos</p>
          <p className="text-sm text-gray-400">Los nuevos pedidos aparecerán aquí automáticamente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtrados.map(pedido => (
            <CocinaCard
              key={pedido.idPedido}
              pedido={pedido}
              onIniciar={p => cambiarEstado(p, "En_preparacion")}
              onEntregar={p => cambiarEstado(p, "Entregado")}
            />
          ))}
        </div>
      )}
    </div>
  );
}