import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { detallePedidoService } from "../../services/detallePedidoService";
import Swal from "sweetalert2";

export default function DetallesPedido() {
  const { id } = useParams();
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigator = useNavigate();

  useEffect(() => {
    const cargarDetalles = async () => {
      try {
        const data = await detallePedidoService.listarPorPedido(id);

        const detallesConSubtotales = data.map((item) => ({
          ...item,
          precioUnitario: item.precioUnitario ?? item.plato?.precio ?? 0,
          subtotal:
            (item.precioUnitario ?? item.plato?.precio ?? 0) * item.cantidad,
        }));

        setDetalles(detallesConSubtotales);
        calcularTotal(detallesConSubtotales);
      } catch (error) {
        console.error("Error al cargar detalles del pedido:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDetalles();
  }, [id]);

  const calcularTotal = (lista) => {
    const t = lista.reduce((sum, item) => sum + item.subtotal, 0);
    setTotal(t);
  };

  const formatNumber = (num) => Number(num).toLocaleString("es-CO");

  //Modificar cantidad
  const actualizarCantidad = (idDetalle, nuevaCantidad) => {
    setDetalles((prev) => {
      const updated = prev.map((d) =>
        d.idDetallePedido === idDetalle
          ? {
              ...d,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * d.precioUnitario,
            }
          : d
      );

      calcularTotal(updated);
      return updated;
    });
  };

  //Eliminar detalle con Sweet Alert
  const eliminarDetalle = async (idDetalle) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Este cambio no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await detallePedidoService.eliminar(idDetalle);

      const nuevos = detalles.filter((d) => d.idDetallePedido !== idDetalle);
      setDetalles(nuevos);
      calcularTotal(nuevos);

      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "El producto fue eliminado del pedido",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el producto",
      });
      console.error(error);
    }
  };

  //Guardar cambios con Sweet Alert
  const guardarCambios = async () => {
    try {
      for (const d of detalles) {
        await detallePedidoService.actualizar(d.idDetallePedido, {
          pedido: { idPedido: Number(id) },
          plato: { idPlato: d.plato.idPlato },
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
        });
      }

      await Swal.fire({
        icon: "success",
        title: "Cambios guardados",
        text: "El pedido se actualizó correctamente",
        timer: 1500,
        showConfirmButton: false,
      });

      navigator("/mesero/pedidos");
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema guardando los cambios",
      });
      console.error(e);
    }
  };

  if (loading) return <p>Cargando detalles...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Detalles del Pedido #{id}
      </h1>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">Producto</th>
            <th className="border p-2 text-center">Cantidad</th>
            <th className="border p-2 text-right">Precio Unitario</th>
            <th className="border p-2 text-right">Subtotal</th>
            <th className="border p-2 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {detalles.map((item) => (
            <tr key={item.idDetallePedido}>
              <td className="border p-2">{item.plato.nombre}</td>

              <td className="border p-2 text-center">
                <button
                  className="px-2 bg-red-500 text-white rounded"
                  onClick={() =>
                    item.cantidad > 1 &&
                    actualizarCantidad(
                      item.idDetallePedido,
                      item.cantidad - 1
                    )
                  }
                >
                  -
                </button>

                <span className="mx-2">{item.cantidad}</span>

                <button
                  className="px-2 bg-green-500 text-white rounded"
                  onClick={() =>
                    actualizarCantidad(
                      item.idDetallePedido,
                      item.cantidad + 1
                    )
                  }
                >
                  +
                </button>
              </td>

              <td className="border p-2 text-right">
                {formatNumber(item.precioUnitario)}
              </td>

              <td className="border p-2 text-right">
                {formatNumber(item.subtotal)}
              </td>

              <td className="border p-2 text-center">
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => eliminarDetalle(item.idDetallePedido)}
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right font-bold text-lg">
        Total: {formatNumber(total)}
      </div>

      <button
        onClick={guardarCambios}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Guardar Cambios
      </button>
    </div>
  );
}
