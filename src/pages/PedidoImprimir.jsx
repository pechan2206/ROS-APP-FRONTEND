import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { detallePedidoService } from "../services/detallePedidoService";
import { pedidoService } from "../services/pedidoService";

export default function PedidoImprimir() {
  const { id } = useParams();
  const [detalles, setDetalles] = useState([]);
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      try {
        const pedidos = await pedidoService.listar();
        const encontrado = pedidos.find((p) => p.idPedido == id);

        if (!encontrado) {
          setLoading(false);
          return;
        }

        setPedido(encontrado);

        const data = await detallePedidoService.listarPorPedido(id);

        const lista = data.map((item) => ({
          ...item,
          precioUnitario: item.precioUnitario ?? item.plato?.precio ?? 0,
          subtotal:
            (item.precioUnitario ?? item.plato?.precio ?? 0) * item.cantidad,
        }));

        setDetalles(lista);
        setTotal(lista.reduce((acc, d) => acc + d.subtotal, 0));
      } catch (error) {
        console.error("Error cargando datos", error);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id]);

  useEffect(() => {
    if (!loading && pedido) {
      setTimeout(() => window.print(), 400);
    }
  }, [loading, pedido]);

  const formatNumber = (num) => Number(num).toLocaleString("es-CO");

  if (loading) return <p>Cargando...</p>;
  if (!pedido) return <p>No se encontró el pedido.</p>;

  const cliente = pedido.cliente;

  return (
    <div
      style={{
        padding: "25px",
        fontFamily: "monospace",
        width: "320px",
        margin: "auto",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      {/* ENCABEZADO */}
      <h1 style={{ textAlign: "center", margin: 0 }}>🍽️ PANCHO PAISA</h1>
      <p style={{ textAlign: "center", margin: 0, fontSize: "12px" }}>
        Rápido · Rico · Casero
      </p>
      <p style={{ textAlign: "center", fontSize: "11px", marginTop: "5px" }}>
        Cra 45 # 12-34 · Tel: 300 000 0000
      </p>

      <hr />

      {/* INFO DEL PEDIDO */}
      <div style={{ fontSize: "13px", marginBottom: "10px" }}>
        <strong>Pedido:</strong> #{id} <br />
        <strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString("es-CO")} 
        <br />
        <strong>Tipo:</strong> {pedido.tipo}
      </div>

      {/* CLIENTE */}
      {cliente && (
        <div
          style={{
            background: "#f7f7f7",
            padding: "10px",
            borderRadius: "6px",
            fontSize: "13px",
            marginBottom: "10px",
          }}
        >
          <strong>Cliente:</strong> {cliente.nombre} <br />
          <strong>Tel:</strong> {cliente.telefono} <br />
          <strong>Dirección:</strong> {cliente.direccion} <br />
          {cliente.descripcion && (
            <>
              <strong>Detalle:</strong> {cliente.descripcion}
              <br />
            </>
          )}
        </div>
      )}

      <hr />

      {/* TABLA DE DETALLES */}
      <div style={{ fontSize: "13px" }}>
        {detalles.map((item) => (
          <div key={item.idDetallePedido} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{item.plato.nombre}</strong>
              <strong>${formatNumber(item.subtotal)}</strong>
            </div>

            <div style={{ fontSize: "12px" }}>
              {item.cantidad} x ${formatNumber(item.precioUnitario)}
            </div>
          </div>
        ))}
      </div>

      <hr />

      {/* TOTAL */}
      <h2 style={{ textAlign: "right", margin: 0 }}>
        TOTAL: ${formatNumber(total)}
      </h2>

      <hr />

      {/* PIE */}
      <p
        style={{
          textAlign: "center",
          fontSize: "12px",
          marginTop: "10px",
          color: "#555",
        }}
      >
        ¡Gracias por su compra!  
        <br />
        💛 Pancho Paisa te alimenta con amor
      </p>
    </div>
  );
}
