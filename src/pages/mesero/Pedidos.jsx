// Pedidos.jsx — Página unificada con Tailwind CSS
// Izquierda: crear / editar pedido | Derecha: lista y gestión de pedidos

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pedidoService } from "../../services/pedidoService";
import { clienteService } from "../../services/clienteService";
import { enumService } from "../../services/enumService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// ── Helpers ────────────────────────────────────────────────────────────────
const formatCOP = (n) =>
  !n && n !== 0 ? "—" : "$" + Number(n).toLocaleString("es-CO");

const getTipoCfg = (tipo) => {
  const t = tipo?.trim().toUpperCase();
  if (t === "MESA")      return { chip: "bg-blue-500",   border: "border-blue-500",  ring: "ring-blue-200"   };
  if (t === "LLEVAR")    return { chip: "bg-green-500",  border: "border-green-500", ring: "ring-green-200"  };
  if (t === "DOMICILIO") return { chip: "bg-purple-500", border: "border-purple-500",ring: "ring-purple-200" };
  return { chip: "bg-gray-400", border: "border-gray-300", ring: "ring-gray-200" };
};

const getEstadoCfg = (estado) => {
  const map = {
    Pendiente:          "bg-yellow-50 text-yellow-800 border-yellow-300",
    "En preparación":   "bg-orange-50 text-orange-800 border-orange-300",
    Listo:              "bg-green-50  text-green-800  border-green-300",
    Entregado:          "bg-gray-50   text-gray-600   border-gray-300",
    Anulado:            "bg-red-50    text-red-800    border-red-300",
  };
  return map[estado] || "bg-gray-50 text-gray-600 border-gray-300";
};

// ── Primitivos ─────────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {children}
    </label>
  );
}

function FieldInput({ disabled, className = "", ...props }) {
  return (
    <input
      {...props}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none transition
        focus:border-blue-500 focus:ring-2 focus:ring-blue-100
        disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
        ${className}`}
    />
  );
}

function FieldSelect({ children, disabled, className = "", ...props }) {
  return (
    <select
      {...props}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none transition
        focus:border-blue-500 focus:ring-2 focus:ring-blue-100
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}`}
    >
      {children}
    </select>
  );
}

function Btn({ children, onClick, variant = "gray", title, small, fullWidth }) {
  const base = `inline-flex items-center gap-1.5 font-semibold rounded-lg transition cursor-pointer whitespace-nowrap
    ${small ? "text-xs px-2.5 py-1.5" : "text-sm px-4 py-2"}
    ${fullWidth ? "w-full justify-center" : ""}`;

  const variants = {
    primary: "bg-blue-600   hover:bg-blue-700   text-white shadow-sm",
    success: "bg-green-600  hover:bg-green-700  text-white shadow-sm",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm",
    danger:  "bg-red-600    hover:bg-red-700    text-white shadow-sm",
    purple:  "bg-purple-600 hover:bg-purple-700 text-white shadow-sm",
    gray:    "bg-white      hover:bg-gray-50    text-gray-700 border border-gray-300",
  };

  return (
    <button onClick={onClick} title={title} className={`${base} ${variants[variant] || variants.gray}`}>
      {children}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PANEL IZQUIERDO — Formulario
// ══════════════════════════════════════════════════════════════════════════════
function PanelFormulario({ pedidoEdit, onGuardar, onCancelarEdit }) {
  const navigate = useNavigate();
  const SweetAlert = withReactContent(Swal);
  const esCancelado = pedidoEdit?.estado === "Anulado";
  const esEdicion = !!pedidoEdit?.idPedido;

  const [tipos, setTipos] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [form, setForm] = useState({
    tipo: "Mesa", mesaId: "", clienteTelefono: "", estado: "Pendiente", total: 0,
  });

  useEffect(() => {
    setForm(pedidoEdit ? {
      tipo: pedidoEdit.tipo || "Mesa",
      mesaId: pedidoEdit.mesa?.idMesa || "",
      clienteTelefono: pedidoEdit.cliente?.telefono || "",
      estado: pedidoEdit.estado || "Pendiente",
      total: pedidoEdit.total || 0,
    } : { tipo: "Mesa", mesaId: "", clienteTelefono: "", estado: "Pendiente", total: 0 });
    setSugerencias([]); setShowSug(false);
  }, [pedidoEdit]);

  useEffect(() => {
    enumService.tipos().then(d => setTipos(d || [])).catch(() => setTipos([]));
  }, []);

  const handleChange = async (e) => {
    if (esCancelado) return;
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "clienteTelefono" && value.length > 0) {
      try { const r = await clienteService.buscarPorTelefono(value); setSugerencias(r); setShowSug(true); }
      catch { setSugerencias([]); setShowSug(false); }
    } else { setShowSug(false); }
  };

  const cancelarPedido = () => {
    SweetAlert.fire({
      title: "¿Cancelar pedido?", text: "Esta acción no se puede deshacer.",
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Sí, cancelar", cancelButtonText: "No",
      confirmButtonColor: "#dc2626",
    }).then(async r => {
      if (r.isConfirmed) {
        const u = { ...pedidoEdit, estado: "Anulado" };
        await pedidoService.actualizar(pedidoEdit.idPedido, u);
        onGuardar(u);
        SweetAlert.fire({ icon: "success", title: "Pedido cancelado", timer: 1500, showConfirmButton: false });
      }
    });
  };

  const handleGuardar = () => {
    onGuardar({
      ...pedidoEdit,
      mesa: form.tipo === "Mesa" ? { idMesa: form.mesaId } : null,
      cliente: { telefono: form.clienteTelefono },
      tipo: form.tipo, estado: form.estado,
      total: parseFloat(form.total) || 0,
    });
  };

  return (
    // h-fit = altura ajustada al contenido, no infinita
    // shadow-xl + ring = más destacado visualmente
    <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl ring-1 ring-gray-300/60 overflow-visible h-fit sticky top-6">

      {/* Header */}
      <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 rounded-t-2xl flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">
            {esEdicion ? `Editando #${pedidoEdit.idPedido}` : "Nuevo pedido"}
          </p>
          <h2 className="text-xl font-bold text-gray-800">
            {esEdicion ? "Editar pedido" : "Crear pedido"}
          </h2>
        </div>
        {esEdicion && (
          <button
            onClick={onCancelarEdit}
            className="text-xs font-semibold text-gray-400 border border-gray-300 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 transition"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Cuerpo */}
      <div className="p-5 flex flex-col gap-4">

        {/* Banner anulado */}
        {esCancelado && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-800 text-center">
            ⚠️ Este pedido está anulado
          </div>
        )}

        {/* Tipo */}
        <div>
          <Label>Tipo de pedido</Label>
          <FieldSelect name="tipo" value={form.tipo} onChange={handleChange} disabled={esCancelado}>
            <option value="">Selecciona tipo…</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </FieldSelect>
        </div>

        {/* Mesa */}
        {form.tipo === "Mesa" && (
          <div>
            <Label>Número de mesa</Label>
            <FieldInput
              type="number" name="mesaId" value={form.mesaId}
              onChange={handleChange} disabled={esCancelado} placeholder="Ej: 5"
            />
          </div>
        )}

        {/* Teléfono + autocomplete */}
        <div className="relative">
          <Label>Teléfono del cliente</Label>
          <FieldInput
            type="text" name="clienteTelefono" value={form.clienteTelefono}
            onChange={handleChange} disabled={esCancelado}
            autoComplete="off" placeholder="Ej: 3001234567"
          />
          {showSug && !esCancelado && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
              {sugerencias.length > 0 ? sugerencias.map(cl => (
                <div
                  key={cl.idCliente}
                  onClick={() => { setForm(p => ({ ...p, clienteTelefono: cl.telefono })); setShowSug(false); }}
                  className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <strong className="text-gray-800">{cl.telefono}</strong> — {cl.nombre}
                </div>
              )) : (
                <div className="px-3 py-2 text-sm text-red-600 flex items-center justify-between">
                  Cliente no encontrado
                  <button
                    onClick={() => navigate("/mesero/crear-cliente")}
                    className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-100"
                  >
                    + Crear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total solo en edición */}
        {esEdicion && (
          <div>
            <Label>Total</Label>
            <p className="text-2xl font-bold text-gray-800">{formatCOP(form.total)}</p>
          </div>
        )}

        {/* Acciones rápidas en edición */}
        {esEdicion && !esCancelado && (
          <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-200">
            <Btn small variant="success" onClick={() => navigate(`detalles/${pedidoEdit.idPedido}`)}>
              Ver detalles
            </Btn>
            <Btn small variant="warning" onClick={() => navigate(`${pedidoEdit.idPedido}/platos`)}>
              Agregar productos
            </Btn>
            <Btn small variant="purple" title="Imprimir pedido" onClick={() => navigate(`/mesero/pedido/${pedidoEdit.idPedido}/imprimir`)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="white">
                <path d="M6 9V2h12v7h2v8h-4v4H8v-4H4V9h2zm2-5v5h8V4H8zm8 14v-4H8v4h8z" />
              </svg>
              Imprimir
            </Btn>
            <Btn small variant="danger" onClick={cancelarPedido}>Cancelar</Btn>
          </div>
        )}
      </div>

      {/* Footer */}
      {!esCancelado && (
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <Btn variant="primary" fullWidth onClick={handleGuardar}>
            {esEdicion ? "Guardar cambios" : "Crear pedido"}
          </Btn>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TARJETA DE PEDIDO
// ══════════════════════════════════════════════════════════════════════════════
function PedidoCardInline({ pedido, onEditar, isSelected }) {
  const cfg = getTipoCfg(pedido.tipo);
  const estadoClass = getEstadoCfg(pedido.estado);

  return (
    <button
      onClick={() => onEditar(pedido)}
      className={`relative bg-white border-2 rounded-2xl p-4 pb-5 w-full text-left cursor-pointer
        flex flex-col gap-3 overflow-hidden transition-all duration-200
        ${isSelected
          ? `${cfg.border} ring-2 ${cfg.ring} shadow-md`
          : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
        }`}
    >
      {/* Barra inferior de color */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${cfg.chip} rounded-b-2xl`} />

      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Pedido #{pedido.idPedido}</h3>
        <span className={`text-xs font-semibold px-3 py-0.5 rounded-full text-white ${cfg.chip}`}>
          {pedido.tipo}
        </span>
      </div>

      {/* Mesa / Estado */}
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-0.5">
            {pedido.tipo === "Mesa" ? "Mesa" : "Tipo"}
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {pedido.tipo === "Mesa" ? (pedido.mesa?.numero ?? "N/A") : pedido.tipo}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-0.5">Estado</p>
          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${estadoClass}`}>
            {pedido.estado || "N/A"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Cliente / Total */}
      <div className="flex justify-between items-end pb-1">
        <div className="flex-1 overflow-hidden pr-2">
          <p className="text-xs text-gray-400 mb-0.5">Nombre</p>
          <p className="text-sm font-semibold text-gray-800 truncate" title={pedido.cliente?.nombre || "N/A"}>
            {pedido.cliente?.nombre || "N/A"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-0.5">Total</p>
          <p className="text-base font-bold text-gray-800">{formatCOP(pedido.total)}</p>
        </div>
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PANEL DERECHO — Lista
// ══════════════════════════════════════════════════════════════════════════════
function PanelLista({ pedidos, filtroTipo, onFiltrar, onEditar, loading, pedidoEditId }) {
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    enumService.tipos().then(d => setTipos(d || [])).catch(() => setTipos([]));
  }, []);

  const filtrados = filtroTipo ? pedidos.filter(p => p.tipo === filtroTipo) : pedidos;

  const tipoBtnCfg = {
    Mesa:      { active: "bg-blue-600 text-white border-blue-600",    inactive: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"    },
    Llevar:    { active: "bg-green-600 text-white border-green-600",   inactive: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"   },
    Domicilio: { active: "bg-purple-600 text-white border-purple-600", inactive: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Cabecera */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Pedidos</h1>
        <span className="text-sm text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1">
          {filtrados.length} de {pedidos.length}
        </span>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onFiltrar("")}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border transition
            ${filtroTipo === "" ? "bg-gray-700 text-white border-gray-700" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
        >
          Todos
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
            ${filtroTipo === "" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
            {pedidos.length}
          </span>
        </button>

        {tipos.map(tipo => {
          const activo = filtroTipo === tipo;
          const cfg = tipoBtnCfg[tipo] || { active: "bg-gray-600 text-white border-gray-600", inactive: "bg-gray-50 text-gray-600 border-gray-200" };
          const cnt = pedidos.filter(p => p.tipo === tipo).length;
          return (
            <button
              key={tipo}
              onClick={() => onFiltrar(activo ? "" : tipo)}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border transition
                ${activo ? cfg.active : cfg.inactive}`}
            >
              {tipo}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
                ${activo ? "bg-white/25 text-white" : "bg-white/60 opacity-80"}`}>
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center gap-3 py-10 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Cargando pedidos…
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-semibold text-gray-600 mb-1">Sin pedidos</p>
          <p className="text-sm">
            {filtroTipo
              ? `No hay pedidos de tipo "${filtroTipo}"`
              : "Crea el primero desde el panel izquierdo"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtrados.map(p => (
            <PedidoCardInline
              key={p.idPedido}
              pedido={p}
              onEditar={onEditar}
              isSelected={p.idPedido === pedidoEditId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [pedidoEdit, setPedidoEdit] = useState(null);
  const navigate = useNavigate();

  const cargar = async () => {
    try { const data = await pedidoService.listar(); setPedidos(data); }
    catch (e) { console.error("Error:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (data) => {
    try {
      if (data.idPedido) {
        await pedidoService.actualizar(data.idPedido, data);
        setPedidoEdit(null);
      } else {
        const nuevo = await pedidoService.crear(data);
        navigate(`${nuevo.idPedido}/platos`);
      }
      cargar();
    } catch (e) { console.error("Error al guardar:", e); }
  };

  return (
    // items-start es clave: cada columna solo ocupa lo que necesita en altura
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: "320px 1fr" }}>
        <PanelFormulario
          pedidoEdit={pedidoEdit}
          onGuardar={guardar}
          onCancelarEdit={() => setPedidoEdit(null)}
        />
        <PanelLista
          pedidos={pedidos}
          filtroTipo={filtroTipo}
          onFiltrar={setFiltroTipo}
          onEditar={p => setPedidoEdit(p)}
          loading={loading}
          pedidoEditId={pedidoEdit?.idPedido}
        />
      </div>
    </div>
  );
}