// PedidoCard.jsx
// Estilos alineados con el diseño claro y moderno (Fraunces + Instrument Sans)
// Requiere que el index.css o App.css importe las fuentes de Google:
// @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;600;900&family=Instrument+Sans:wght@400;500;600&display=swap');

export default function PedidoCard({ pedido, onClick }) {
  const tipoNormalizado = pedido.tipo?.trim().toUpperCase();

  // Paleta por tipo — coherente con el sistema de diseño
  const tipoConfig = {
    MESA: {
      dot: "#1e4d8c",
      chipBg: "#eef3fb",
      chipText: "#1e4d8c",
      bar: "#1e4d8c",
    },
    LLEVAR: {
      dot: "#2d6a4f",
      chipBg: "#ebf5f0",
      chipText: "#2d6a4f",
      bar: "#2d6a4f",
    },
    DOMICILIO: {
      dot: "#b5831a",
      chipBg: "#fdf6e3",
      chipText: "#b5831a",
      bar: "#b5831a",
    },
  };

  const cfg = tipoConfig[tipoNormalizado] || {
    dot: "#9e9589",
    chipBg: "#f5f2ee",
    chipText: "#5a534a",
    bar: "#9e9589",
  };

  const formatTotal = (num) => {
    if (!num && num !== 0) return "—";
    return "$" + Number(num).toLocaleString("es-CO");
  };

  const estadoConfig = {
    Pendiente: { bg: "#fdf6e3", text: "#b5831a" },
    "En preparación": { bg: "#fdf0ed", text: "#c84b2f" },
    Listo: { bg: "#ebf5f0", text: "#2d6a4f" },
    Entregado: { bg: "#f5f2ee", text: "#9e9589" },
    Anulado: { bg: "#fdf0ed", text: "#c84b2f" },
  };

  const estadoStyle = estadoConfig[pedido.estado] || {
    bg: "#f5f2ee",
    text: "#9e9589",
  };

  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Instrument Sans', sans-serif",
        position: "relative",
        background: "#ffffff",
        border: "1px solid #e5e0d8",
        borderRadius: "14px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        padding: "1rem 1rem 1.25rem",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s, transform 0.15s",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)";
        e.currentTarget.style.borderColor = "#d4cdc3";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
        e.currentTarget.style.borderColor = "#e5e0d8";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Barra superior de color por tipo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: cfg.bar,
          borderRadius: "14px 14px 0 0",
        }}
      />

      {/* Encabezado */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: "0.25rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#9e9589",
              marginBottom: "0.15rem",
            }}
          >
            Pedido
          </div>
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#1a1714",
              lineHeight: 1,
            }}
          >
            #{pedido.idPedido}
          </div>
        </div>

        {/* Chip tipo */}
        <span
          style={{
            background: cfg.chipBg,
            color: cfg.chipText,
            fontSize: "0.68rem",
            fontWeight: 600,
            padding: "0.25rem 0.65rem",
            borderRadius: "20px",
            letterSpacing: "0.04em",
            border: `1px solid ${cfg.dot}22`,
          }}
        >
          {pedido.tipo}
        </span>
      </div>

      {/* Info principal */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem",
        }}
      >
        {/* Mesa o tipo */}
        <div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "#9e9589",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "0.2rem",
            }}
          >
            {pedido.tipo === "Mesa" ? "Mesa" : "Tipo"}
          </div>
          <div
            style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1714" }}
          >
            {pedido.tipo === "Mesa"
              ? pedido.mesa?.numero ?? "N/A"
              : pedido.tipo}
          </div>
        </div>

        {/* Estado */}
        <div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "#9e9589",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "0.2rem",
            }}
          >
            Estado
          </div>
          <span
            style={{
              display: "inline-block",
              background: estadoStyle.bg,
              color: estadoStyle.text,
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "0.15rem 0.55rem",
              borderRadius: "10px",
            }}
          >
            {pedido.estado || "N/A"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #e5e0d8" }} />

      {/* Pie: cliente y total */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 1, paddingRight: "0.5rem", overflow: "hidden" }}>
          <div
            style={{
              fontSize: "0.65rem",
              color: "#9e9589",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "0.2rem",
            }}
          >
            Cliente
          </div>
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#1a1714",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={pedido.cliente?.nombre || "N/A"}
          >
            {pedido.cliente?.nombre || "N/A"}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "0.65rem",
              color: "#9e9589",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "0.2rem",
            }}
          >
            Total
          </div>
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#c84b2f",
            }}
          >
            {formatTotal(pedido.total)}
          </div>
        </div>
      </div>
    </button>
  );
}