import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { detallePedidoService } from "../../services/detallePedidoService";

export default function DetallesPedido() {
  const { id } = useParams(); // id del pedido
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const cargarDetalles = async () => {
      try {
        // Trae solo los detalles del pedido con el id
        const data = await detallePedidoService.listarPorPedido(id);

        // Agrupar productos repetidos
        const agrupados = Object.values(
          data.reduce((acc, item) => {
            const nombre = item.plato?.nombre?.trim() || "Desconocido";
            const precioUnitario = item.precio ?? item.plato?.precio ?? 0;
            const cantidad = item.cantidad ?? 0;

            if (acc[nombre]) {
              acc[nombre].cantidad += cantidad;
            } else {
              acc[nombre] = {
                nombre,
                cantidad,
                precio: precioUnitario,
              };
            }

            return acc;
          }, {})
        );

        setDetalles(agrupados);

        // Calcular total
        const totalPedido = agrupados.reduce(
          (sum, item) => sum + item.cantidad * item.precio,
          0
        );
        setTotal(totalPedido);
      } catch (error) {
        console.error("Error al cargar detalles del pedido:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDetalles();
  }, [id]);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return Number(num).toLocaleString("es-CO", { minimumFractionDigits: 0 });
  };

  if (loading) return <p>Cargando detalles...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalles del Pedido #{id}</h1>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">Producto</th>
            <th className="border p-2">Cantidad</th>
            <th className="border p-2">Precio Unitario</th>
            <th className="border p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((item) => (
            <tr key={item.nombre}>
              <td className="border p-2">{item.nombre}</td>
              <td className="border p-2 text-center">{item.cantidad}</td>
              <td className="border p-2 text-right">{formatNumber(item.precio)}</td>
              <td className="border p-2 text-right">{formatNumber(item.precio * item.cantidad)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right font-bold text-lg">
        Total: {formatNumber(total)}
      </div>
    </div>
  );
}
