// PedidoModal.jsx
// Modal para crear/editar pedidos — diseño claro y moderno

import { useState, useEffect } from "react";
import SelectTipoPedido from "./SelectTipoPedido";
import { clienteService } from "../services/clienteService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { pedidoService } from "../services/pedidoService";

// ── Estilos base reutilizables ──────────────────────────────────────────────
const FONT = "'Instrument Sans', sans-serif";
const FONT_SERIF = "'Fraunces', serif";

const COLOR = {
  bg: "#f5f2ee",
  white: "#ffffff",
  border: "#e5e0d8",
  border2: "#d4cdc3",
  text: "#1a1714",
  text2: "#5a534a",
  muted: "#9e9589",
  accent: "#c84b2f",
  accentLight: "#fdf0ed",
};

const labelStyle = {
  fontFamily: FONT,
  fontSize: "0.68rem",
  fontWeight: 600,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: COLOR.muted,
  display: "block",
  marginBottom: "0.4rem",
};

const inputStyle = (disabled = false) => ({
  fontFamily: FONT,
  width: "100%",
  background: disabled ? COLOR.bg : COLOR.white,
  border: `1px solid ${COLOR.border}`,
  color: disabled ? COLOR.muted : COLOR.text,
  padding: "0.6rem 0.85rem",
  borderRadius: "8px",
  fontSize: "0.88rem",
  outline: "none",
  cursor: disabled ? "not-allowed" : "text",
  transition: "border-color 0.2s",
});

// ── Botón de acción ────────────────────────────────────────────────────────
function ActionBtn({ onClick, children, variant = "default", title }) {
  const variants = {
    default: {
      background: COLOR.white,
      color: COLOR.text2,
      border: `1px solid ${COLOR.border}`,
    },
    primary: {
      background: COLOR.text,
      color: "#fff",
      border: `1px solid ${COLOR.text}`,
    },
    success: {
      background: "#ebf5f0",
      color: "#2d6a4f",
      border: "1px solid #2d6a4f33",
    },
    warning: {
      background: "#fdf6e3",
      color: "#b5831a",
      border: "1px solid #b5831a33",
    },
    danger: {
      background: COLOR.accentLight,
      color: COLOR.accent,
      border: `1px solid ${COLOR.accent}33`,
    },
    purple: {
      background: "#f3eefb",
      color: "#6d3fa0",
      border: "1px solid #6d3fa033",
    },
  };

  const s = variants[variant] || variants.default;

  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        fontFamily: FONT,
        fontSize: "0.78rem",
        fontWeight: 600,
        padding: "0.5rem 0.85rem",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.15s",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        whiteSpace: "nowrap",
        ...s,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = "brightness(0.93)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export default function PedidoModal({ pedido, onClose, onSave }) {
  const SweetAlert = withReactContent(Swal);
  const navigate = useNavigate();

  const esCancelado = pedido?.estado === "Anulado";

  const [formData, setFormData] = useState({
    mesaId: pedido?.mesa?.idMesa || "",
    clienteTelefono: pedido?.cliente?.telefono || "",
    tipo: pedido?.tipo || "Mesa",
    estado: pedido?.estado || "Pendiente",
    total: pedido?.total || 0,
  });

  const [sugerencias, setSugerencias] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setFormData({
      mesaId: pedido?.mesa?.idMesa || "",
      clienteTelefono: pedido?.cliente?.telefono || "",
      tipo: pedido?.tipo || "Mesa",
      estado: pedido?.estado || "Pendiente",
      total: pedido?.total || 0,
    });
    setSugerencias([]);
    setShowSuggestions(false);
  }, [pedido]);

  const handleChange = async (e) => {
    if (esCancelado) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "clienteTelefono" && value.length > 0) {
      try {
        const clientes = await clienteService.buscarPorTelefono(value);
        setSugerencias(clientes);
        setShowSuggestions(true);
      } catch {
        setSugerencias([]);
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const seleccionarSugerencia = (telefono) => {
    if (esCancelado) return;
    setFormData((prev) => ({ ...prev, clienteTelefono: telefono }));
    setShowSuggestions(false);
  };

  const formatTotal = (num) => {
    if (num == null) return "";
    return "$" + Number(num).toLocaleString("es-CO");
  };

  const handleSubmit = () => {
    onSave({
      ...pedido,
      mesa: formData.tipo === "Mesa" ? { idMesa: formData.mesaId } : null,
      cliente: { telefono: formData.clienteTelefono },
      tipo: formData.tipo,
      estado: formData.estado,
      total: parseFloat(formData.total),
    });
    onClose();
  };

  const cambiarEstadoRapido = async (p, nuevoEstado) => {
    try {
      const updated = { ...p, estado: nuevoEstado };
      await pedidoService.actualizar(p.idPedido, updated);
      onSave(updated);
      onClose();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  return (
    // Overlay
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,23,20,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal box */}
      <div
        style={{
          fontFamily: FONT,
          background: COLOR.white,
          border: `1px solid ${COLOR.border}`,
          borderRadius: "16px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
          overflow: "hidden",
          animation: "modalIn 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: COLOR.bg,
            padding: "1.1rem 1.4rem",
            borderBottom: `1px solid ${COLOR.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: COLOR.muted,
                marginBottom: "0.15rem",
              }}
            >
              {pedido ? `Pedido #${pedido.idPedido}` : "Nuevo"}
            </div>
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontSize: "1.15rem",
                fontWeight: 700,
                color: COLOR.text,
              }}
            >
              {pedido ? "Editar Pedido" : "Crear Pedido"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: `1px solid ${COLOR.border}`,
              background: COLOR.white,
              color: COLOR.muted,
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLOR.accentLight;
              e.currentTarget.style.color = COLOR.accent;
              e.currentTarget.style.borderColor = `${COLOR.accent}44`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLOR.white;
              e.currentTarget.style.color = COLOR.muted;
              e.currentTarget.style.borderColor = COLOR.border;
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.3rem 1.4rem" }}>

          {/* Banner anulado */}
          {esCancelado && (
            <div
              style={{
                background: COLOR.accentLight,
                border: `1px solid ${COLOR.accent}33`,
                borderRadius: "8px",
                padding: "0.6rem 0.9rem",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: COLOR.accent,
                textAlign: "center",
              }}
            >
              ⚠️ Este pedido ha sido anulado
            </div>
          )}

          {/* Tipo */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Tipo de pedido</label>
            <SelectTipoPedido
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              disabled={esCancelado}
              required
              // Pasa un className o style si SelectTipoPedido lo acepta
            />
          </div>

          {/* Mesa */}
          {formData.tipo === "Mesa" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Número de mesa</label>
              <input
                type="number"
                name="mesaId"
                value={formData.mesaId}
                onChange={handleChange}
                disabled={esCancelado}
                required
                style={inputStyle(esCancelado)}
                onFocus={(e) => {
                  if (!esCancelado) e.target.style.borderColor = COLOR.accent;
                }}
                onBlur={(e) => { e.target.style.borderColor = COLOR.border; }}
              />
            </div>
          )}

          {/* Teléfono */}
          <div style={{ marginBottom: "1rem", position: "relative" }}>
            <label style={labelStyle}>Teléfono del cliente</label>
            <input
              type="text"
              name="clienteTelefono"
              value={formData.clienteTelefono}
              onChange={handleChange}
              autoComplete="off"
              disabled={esCancelado}
              required
              style={inputStyle(esCancelado)}
              onFocus={(e) => {
                if (!esCancelado) e.target.style.borderColor = COLOR.accent;
              }}
              onBlur={(e) => { e.target.style.borderColor = COLOR.border; }}
            />

            {/* Autocomplete */}
            {showSuggestions && !esCancelado && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  background: COLOR.white,
                  border: `1px solid ${COLOR.border}`,
                  borderRadius: "8px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  zIndex: 10,
                  maxHeight: "160px",
                  overflowY: "auto",
                }}
              >
                {sugerencias.length > 0 ? (
                  sugerencias.map((cliente) => (
                    <div
                      key={cliente.idCliente}
                      onClick={() => seleccionarSugerencia(cliente.telefono)}
                      style={{
                        padding: "0.6rem 0.85rem",
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        color: COLOR.text2,
                        borderBottom: `1px solid ${COLOR.border}`,
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = COLOR.bg; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontWeight: 600, color: COLOR.text }}>
                        {cliente.telefono}
                      </span>{" "}
                      — {cliente.nombre}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "0.7rem 0.85rem",
                      fontSize: "0.82rem",
                      color: COLOR.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    Cliente no encontrado
                    <button
                      onClick={() => navigate("/mesero/crear-cliente")}
                      style={{
                        fontFamily: FONT,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#1e4d8c",
                        background: "#eef3fb",
                        border: "1px solid #1e4d8c22",
                        borderRadius: "6px",
                        padding: "0.25rem 0.6rem",
                        cursor: "pointer",
                      }}
                    >
                      + Crear nuevo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Total (readonly) */}
          <div style={{ marginBottom: "0" }}>
            <label style={labelStyle}>Total</label>
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontSize: "1.3rem",
                fontWeight: 700,
                color: COLOR.accent,
                padding: "0.5rem 0",
              }}
            >
              {formatTotal(formData.total)}
            </div>
          </div>
        </div>

        {/* Footer de acciones */}
        <div
          style={{
            padding: "1rem 1.4rem",
            borderTop: `1px solid ${COLOR.border}`,
            background: COLOR.bg,
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {pedido?.idPedido && !esCancelado && (
            <ActionBtn
              variant="success"
              onClick={() => navigate(`detalles/${pedido.idPedido}`)}
            >
              📄 Detalles
            </ActionBtn>
          )}

          {pedido?.idPedido && !esCancelado && (
            <ActionBtn
              variant="warning"
              onClick={() => navigate(`${pedido.idPedido}/platos`)}
            >
              ➕ Productos
            </ActionBtn>
          )}

          {pedido?.idPedido && !esCancelado && (
            <ActionBtn
              variant="purple"
              title="Imprimir pedido"
              onClick={() => navigate(`/mesero/pedido/${pedido.idPedido}/imprimir`)}
            >
              🖨️
            </ActionBtn>
          )}

          {pedido?.idPedido && !esCancelado && (
            <ActionBtn
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                SweetAlert.fire({
                  title: "¿Cancelar pedido?",
                  text: "Esta acción no se puede deshacer.",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Sí, cancelar",
                  cancelButtonText: "No",
                  confirmButtonColor: COLOR.accent,
                }).then((result) => {
                  if (result.isConfirmed) {
                    cambiarEstadoRapido(pedido, "Anulado").then(() => {
                      SweetAlert.fire({
                        icon: "success",
                        title: "Pedido cancelado",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                    });
                  }
                });
              }}
            >
              Cancelar
            </ActionBtn>
          )}

          {!esCancelado && (
            <ActionBtn variant="primary" onClick={handleSubmit}>
              Guardar →
            </ActionBtn>
          )}
        </div>
      </div>

      {/* Animación */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}