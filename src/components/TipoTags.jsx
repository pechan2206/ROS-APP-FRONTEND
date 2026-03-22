// TipoTags.jsx
// Barra de filtros por tipo de pedido — diseño claro y moderno

import { useEffect, useState } from "react";
import { enumService } from "../services/enumService";

export default function TipoTags({ filtroActivo, onFiltrar, pedidos = [] }) {
  const [tipos, setTipos] = useState([]);
  const [contadores, setContadores] = useState({});

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await enumService.tipos();
        setTipos(data || []);
      } catch (err) {
        console.error("Error al cargar tipos:", err);
        setTipos([]);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    const conteo = {};
    tipos.forEach((tipo) => {
      conteo[tipo] = pedidos.filter((p) => p.tipo === tipo).length;
    });
    setContadores(conteo);
  }, [tipos, pedidos]);

  // Colores por tipo — coherente con PedidoCard
  const tipoColor = {
    Mesa: { active: "#1e4d8c", activeBg: "#1e4d8c", lightBg: "#eef3fb", lightText: "#1e4d8c" },
    Llevar: { active: "#2d6a4f", activeBg: "#2d6a4f", lightBg: "#ebf5f0", lightText: "#2d6a4f" },
    Domicilio: { active: "#b5831a", activeBg: "#b5831a", lightBg: "#fdf6e3", lightText: "#b5831a" },
  };

  const tagBase = {
    fontFamily: "'Instrument Sans', sans-serif",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.4rem 0.9rem",
    borderRadius: "20px",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid",
    transition: "all 0.18s",
    letterSpacing: "0.02em",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        marginBottom: "1.25rem",
        alignItems: "center",
      }}
    >
      {/* Todos */}
      <button
        onClick={() => onFiltrar("")}
        style={{
          ...tagBase,
          background: filtroActivo === "" ? "#1a1714" : "#ffffff",
          color: filtroActivo === "" ? "#ffffff" : "#5a534a",
          borderColor: filtroActivo === "" ? "#1a1714" : "#e5e0d8",
          boxShadow:
            filtroActivo === ""
              ? "0 2px 8px rgba(26,23,20,0.15)"
              : "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        Todos
        <span
          style={{
            background: filtroActivo === "" ? "rgba(255,255,255,0.2)" : "#f5f2ee",
            color: filtroActivo === "" ? "#fff" : "#9e9589",
            fontSize: "0.68rem",
            fontWeight: 700,
            padding: "0.1rem 0.45rem",
            borderRadius: "10px",
            minWidth: "20px",
            textAlign: "center",
          }}
        >
          {pedidos.length}
        </span>
      </button>

      {/* Tags por tipo */}
      {tipos.map((tipo) => {
        const activo = filtroActivo === tipo;
        const cfg = tipoColor[tipo] || {
          activeBg: "#5a534a",
          lightBg: "#f5f2ee",
          lightText: "#5a534a",
        };
        const cnt = contadores[tipo] ?? 0;

        return (
          <button
            key={tipo}
            onClick={() => onFiltrar(activo ? "" : tipo)}
            style={{
              ...tagBase,
              background: activo ? cfg.activeBg : cfg.lightBg,
              color: activo ? "#ffffff" : cfg.lightText,
              borderColor: activo ? cfg.activeBg : `${cfg.lightText}33`,
              boxShadow: activo
                ? `0 2px 8px ${cfg.activeBg}33`
                : "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {tipo}
            <span
              style={{
                background: activo ? "rgba(255,255,255,0.25)" : `${cfg.lightText}22`,
                color: activo ? "#fff" : cfg.lightText,
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "0.1rem 0.45rem",
                borderRadius: "10px",
                minWidth: "20px",
                textAlign: "center",
              }}
            >
              {cnt}
            </span>
          </button>
        );
      })}
    </div>
  );
}