// Pedidos.jsx — Página unificada con Tailwind CSS — Responsive
// Filtros combinados: tipo de pedido + estado del pedido

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
  if (t === "MESA")      return { chip: "bg-blue-500",   border: "border-blue-500",   ring: "ring-blue-200"   };
  if (t === "LLEVAR")    return { chip: "bg-green-500",  border: "border-green-500",  ring: "ring-green-200"  };
  if (t === "DOMICILIO") return { chip: "bg-purple-500", border: "border-purple-500", ring: "ring-purple-200" };
  return { chip: "bg-gray-400", border: "border-gray-300", ring: "ring-gray-200" };
};

const getEstadoCfg = (estado) => {
  const map = {
    Pendiente:      "bg-yellow-50 text-yellow-800 border-yellow-300",
    En_preparacion: "bg-orange-50 text-orange-800 border-orange-300",
    Entregado:      "bg-green-50  text-green-800  border-green-300",
    Anulado:        "bg-red-50    text-red-800    border-red-300",
    Pagado:         "bg-blue-50   text-blue-800   border-blue-300",
  };
  return map[estado] || "bg-gray-50 text-gray-600 border-gray-300";
};

// Colores de los botones de filtro de estado
const estadoBtnCfg = {
  Pendiente:      { active: "bg-yellow-500 text-white border-yellow-500", inactive: "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100" },
  En_preparacion: { active: "bg-orange-500 text-white border-orange-500", inactive: "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100" },
  Entregado:      { active: "bg-green-600  text-white border-green-600",  inactive: "bg-green-50  text-green-700  border-green-300  hover:bg-green-100"  },
  Anulado:        { active: "bg-red-600    text-white border-red-600",    inactive: "bg-red-50    text-red-700    border-red-300    hover:bg-red-100"    },
  Pagado:         { active: "bg-blue-600   text-white border-blue-600",   inactive: "bg-blue-50   text-blue-700   border-blue-300   hover:bg-blue-100"   },
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

// ── Botón de filtro reutilizable ───────────────────────────────────────────
function FilterBtn({ label, count, activo, cfgActive, cfgInactive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border transition
        ${activo ? cfgActive : cfgInactive}`}
    >
      {label}
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
        ${activo ? "bg-white/25 text-white" : "bg-white/60 opacity-80"}`}>
        {count}
      </span>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PANEL FORMULARIO
// ══════════════════════════════════════════════════════════════════════════════
function PanelFormulario({ pedidoEdit, onGuardar, onCancelarEdit }) {
  const navigate = useNavigate();
  const SweetAlert = withReactContent(Swal);
  const esCancelado = pedidoEdit?.estado === "Anulado";
  const esEdicion   = !!pedidoEdit?.idPedido;

  const [tipos,       setTipos]       = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [showSug,     setShowSug]     = useState(false);
  const [errores,     setErrores]     = useState({});
  const [form, setForm] = useState({
    tipo: "Mesa", mesaId: "", clienteTelefono: "", estado: "Pendiente", total: 0,
  });

  useEffect(() => {
    setForm(pedidoEdit ? {
      tipo:            pedidoEdit.tipo             || "Mesa",
      mesaId:          pedidoEdit.mesa?.idMesa     || "",
      clienteTelefono: pedidoEdit.cliente?.telefono || "",
      estado:          pedidoEdit.estado           || "Pendiente",
      total:           pedidoEdit.total            || 0,
    } : { tipo: "Mesa", mesaId: "", clienteTelefono: "", estado: "Pendiente", total: 0 });
    setSugerencias([]); setShowSug(false); setErrores({});
  }, [pedidoEdit]);

  useEffect(() => {
    enumService.tipos().then(d => setTipos(d || [])).catch(() => setTipos([]));
  }, []);

  const handleChange = async (e) => {
    if (esCancelado) return;
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Limpiar el error del campo en cuanto el usuario escribe
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: "" }));
    if (name === "clienteTelefono" && value.length > 0) {
      try   { const r = await clienteService.buscarPorTelefono(value); setSugerencias(r); setShowSug(true); }
      catch { setSugerencias([]); setShowSug(false); }
    } else  { setShowSug(false); }
  };

  const validar = () => {
    const e = {};
    if (!form.tipo)
      e.tipo = "Selecciona el tipo de pedido.";
    if (form.tipo === "Mesa" && !String(form.mesaId).trim())
      e.mesaId = "Ingresa el número de mesa.";
    if (!form.clienteTelefono.trim())
      e.clienteTelefono = "Ingresa el teléfono del cliente.";
    return e;
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
    const e = validar();
    if (Object.keys(e).length > 0) { setErrores(e); return; }
    setErrores({});
    onGuardar({
      ...pedidoEdit,
      mesa:    form.tipo === "Mesa" ? { idMesa: form.mesaId } : null,
      cliente: { telefono: form.clienteTelefono },
      tipo: form.tipo, estado: form.estado,
      total: parseFloat(form.total) || 0,
    });
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl ring-1 ring-gray-300/60 h-fit md:sticky md:top-6">

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

        {esCancelado && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-800 text-center">
            ⚠️ Este pedido está anulado
          </div>
        )}

        <div>
          <Label>Tipo de pedido</Label>
          <FieldSelect name="tipo" value={form.tipo} onChange={handleChange} disabled={esCancelado}>
            <option value="">Selecciona tipo…</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </FieldSelect>
          {errores.tipo && <p className="text-xs text-red-500 mt-1 font-medium">{errores.tipo}</p>}
        </div>

        {form.tipo === "Mesa" && (
          <div>
            <Label>Número de mesa</Label>
            <FieldInput
              type="number" name="mesaId" value={form.mesaId}
              onChange={handleChange} disabled={esCancelado} placeholder="Ej: 5"
              className={errores.mesaId ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}
            />
            {errores.mesaId && <p className="text-xs text-red-500 mt-1 font-medium">{errores.mesaId}</p>}
          </div>
        )}

        <div className="relative">
          <Label>Teléfono del cliente</Label>
          <FieldInput
            type="text" name="clienteTelefono" value={form.clienteTelefono}
            onChange={handleChange} disabled={esCancelado}
            autoComplete="off" placeholder="Ej: 3001234567"
            className={errores.clienteTelefono ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}
          />
          {errores.clienteTelefono && <p className="text-xs text-red-500 mt-1 font-medium">{errores.clienteTelefono}</p>}
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
                <div className="px-3 py-2 text-sm text-red-600 flex items-center justify-between gap-2">
                  Cliente no encontrado
                  <button
                    onClick={() => navigate("/mesero/crear-cliente")}
                    className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-100 whitespace-nowrap"
                  >
                    + Crear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {esEdicion && (
          <div>
            <Label>Total</Label>
            <p className="text-2xl font-bold text-gray-800">{formatCOP(form.total)}</p>
          </div>
        )}

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
  const cfg        = getTipoCfg(pedido.tipo);
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
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${cfg.chip} rounded-b-2xl`} />

      <div className="flex justify-between items-center gap-2">
        <h3 className="text-base font-bold text-gray-800 truncate">Pedido #{pedido.idPedido}</h3>
        <span className={`shrink-0 text-xs font-semibold px-3 py-0.5 rounded-full text-white ${cfg.chip}`}>
          {pedido.tipo}
        </span>
      </div>

      <div className="flex justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">
            {pedido.tipo === "Mesa" ? "Mesa" : "Tipo"}
          </p>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {pedido.tipo === "Mesa" ? (pedido.mesa?.numero ?? "N/A") : pedido.tipo}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">Estado</p>
          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${estadoClass}`}>
            {pedido.estado || "N/A"}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div className="flex justify-between items-end pb-1 gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-0.5">Nombre</p>
          <p className="text-sm font-semibold text-gray-800 truncate" title={pedido.cliente?.nombre || "N/A"}>
            {pedido.cliente?.nombre || "N/A"}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-400 mb-0.5">Total</p>
          <p className="text-base font-bold text-gray-800">{formatCOP(pedido.total)}</p>
        </div>
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PANEL LISTA
// ══════════════════════════════════════════════════════════════════════════════
function PanelLista({ pedidos, filtroTipo, filtroEstado, onFiltrarTipo, onFiltrarEstado, onEditar, loading, pedidoEditId }) {
  const [tipos,   setTipos]   = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    enumService.tipos().then(d => setTipos(d || [])).catch(() => setTipos([]));
    enumService.estados().then(d => setEstados(d || [])).catch(() => setEstados([]));
  }, []);

  // Filtros combinados
  const filtrados = pedidos
    .filter(p => filtroTipo   ? p.tipo   === filtroTipo   : true)
    .filter(p => filtroEstado ? p.estado === filtroEstado : true);

  const tipoBtnCfg = {
    Mesa:      { active: "bg-blue-600   text-white border-blue-600",   inactive: "bg-blue-50   text-blue-700   border-blue-200   hover:bg-blue-100"   },
    Llevar:    { active: "bg-green-600  text-white border-green-600",  inactive: "bg-green-50  text-green-700  border-green-200  hover:bg-green-100"  },
    Domicilio: { active: "bg-purple-600 text-white border-purple-600", inactive: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
  };

  // Contadores que respetan el otro filtro activo
  const cntTipo   = (tipo)   => pedidos.filter(p => p.tipo   === tipo   && (filtroEstado ? p.estado === filtroEstado : true)).length;
  const cntEstado = (estado) => pedidos.filter(p => p.estado === estado && (filtroTipo   ? p.tipo   === filtroTipo   : true)).length;

  return (
    <div className="flex flex-col gap-4">

      {/* Cabecera */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Pedidos</h1>
        <span className="text-sm text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1 shrink-0">
          {filtrados.length} de {pedidos.length}
        </span>
      </div>

      {/* ── Filtro por TIPO ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Tipo</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">

          {/* Todos los tipos */}
          <FilterBtn
            label="Todos" count={pedidos.filter(p => filtroEstado ? p.estado === filtroEstado : true).length}
            activo={filtroTipo === ""}
            cfgActive="bg-gray-700 text-white border-gray-700"
            cfgInactive="bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            onClick={() => onFiltrarTipo("")}
          />

          {tipos.map(tipo => {
            const cfg = tipoBtnCfg[tipo] || { active: "bg-gray-600 text-white border-gray-600", inactive: "bg-gray-50 text-gray-600 border-gray-200" };
            return (
              <FilterBtn
                key={tipo}
                label={tipo}
                count={cntTipo(tipo)}
                activo={filtroTipo === tipo}
                cfgActive={cfg.active}
                cfgInactive={cfg.inactive}
                onClick={() => onFiltrarTipo(filtroTipo === tipo ? "" : tipo)}
              />
            );
          })}
        </div>
      </div>

      {/* ── Filtro por ESTADO ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Estado</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">

          {/* Todos los estados */}
          <FilterBtn
            label="Todos" count={pedidos.filter(p => filtroTipo ? p.tipo === filtroTipo : true).length}
            activo={filtroEstado === ""}
            cfgActive="bg-gray-700 text-white border-gray-700"
            cfgInactive="bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            onClick={() => onFiltrarEstado("")}
          />

          {estados.map(estado => {
            const cfg = estadoBtnCfg[estado] || { active: "bg-gray-600 text-white border-gray-600", inactive: "bg-gray-50 text-gray-600 border-gray-200" };
            return (
              <FilterBtn
                key={estado}
                label={estado.replace("_", " ")}
                count={cntEstado(estado)}
                activo={filtroEstado === estado}
                cfgActive={cfg.active}
                cfgInactive={cfg.inactive}
                onClick={() => onFiltrarEstado(filtroEstado === estado ? "" : estado)}
              />
            );
          })}
        </div>
      </div>

      {/* ── Indicador de filtros activos ── */}
      {(filtroTipo || filtroEstado) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Filtrando por:</span>
          {filtroTipo && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
              {filtroTipo}
              <button onClick={() => onFiltrarTipo("")} className="ml-1 hover:text-blue-900">✕</button>
            </span>
          )}
          {filtroEstado && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full">
              {filtroEstado.replace("_", " ")}
              <button onClick={() => onFiltrarEstado("")} className="ml-1 hover:text-orange-900">✕</button>
            </span>
          )}
          <button
            onClick={() => { onFiltrarTipo(""); onFiltrarEstado(""); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* ── Tarjetas ── */}
      {loading ? (
        <div className="flex items-center gap-3 py-10 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Cargando pedidos…
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-semibold text-gray-600 mb-1">Sin pedidos</p>
          <p className="text-sm">No hay pedidos con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
  const [pedidos,      setPedidos]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filtroTipo,   setFiltroTipo]   = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [pedidoEdit,   setPedidoEdit]   = useState(null);
  const navigate = useNavigate();

  const cargar = async () => {
    try   { const data = await pedidoService.listar(); setPedidos(data); }
    catch (e) { console.error("Error:", e); }
    finally   { setLoading(false); }
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
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6">
      <div className="flex flex-col md:grid md:gap-6 md:items-start gap-6"
           style={{ gridTemplateColumns: "minmax(0,288px) 1fr" }}>

        <PanelFormulario
          pedidoEdit={pedidoEdit}
          onGuardar={guardar}
          onCancelarEdit={() => setPedidoEdit(null)}
        />

        <PanelLista
          pedidos={pedidos}
          filtroTipo={filtroTipo}
          filtroEstado={filtroEstado}
          onFiltrarTipo={setFiltroTipo}
          onFiltrarEstado={setFiltroEstado}
          onEditar={p => setPedidoEdit(p)}
          loading={loading}
          pedidoEditId={pedidoEdit?.idPedido}
        />
      </div>
    </div>
  );
}