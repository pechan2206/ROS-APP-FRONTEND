import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { platosService } from "../../services/platosService";
import { detallePedidoService } from "../../services/detallePedidoService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function Platos() {
  const { id } = useParams();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState([]);
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await platosService.listar();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  if (loading) return <p>Cargando productos...</p>;

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.idPlato === producto.idPlato);

      if (existe) {
        return prev.map((p) =>
          p.idPlato === producto.idPlato
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      } else {
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
  };

  const quitarDelCarrito = (producto) => {
    setCarrito((prev) =>
      prev
        .map((p) =>
          p.idPlato === producto.idPlato
            ? { ...p, cantidad: p.cantidad - 1 }
            : p
        )
        .filter((p) => p.cantidad > 0)
    );
  };

  const guardarPedido = async () => {
    const confirm = await Swal.fire({
      title: "¿Guardar pedido?",
      text: "Se agregarán los platos seleccionados al pedido",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    try {
      for (const p of carrito) {
        await detallePedidoService.crear({
          pedido: { idPedido: Number(id) },
          plato: { idPlato: p.idPlato },
          cantidad: p.cantidad,
          precioUnitario: p.precio,
          subtotal: p.precio * p.cantidad,
        });
      }

      await Swal.fire({
        icon: "success",
        title: "Pedido guardado",
        text: "Los productos fueron añadidos correctamente",
        timer: 1500,
        showConfirmButton: false,
      });

      setCarrito([]);
      navigate("/mesero/pedidos");
    } catch (error) {
      console.error("Error al guardar pedido:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar el pedido",
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Menú - Pedido #{id}</h1>

      {/* LISTA DE PRODUCTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productos.map((p) => (
          <div key={p.idPlato} className="border rounded p-4 shadow">
            <h2 className="font-bold text-lg">{p.nombre}</h2>
            <p>Precio: ${Number(p.precio).toLocaleString()}</p>

            <button
              onClick={() => agregarAlCarrito(p)}
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
            >
              Agregar
            </button>
          </div>
        ))}
      </div>

      {/* CARRITO */}
      {carrito.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Carrito</h2>

          <ul>
            {carrito.map((p) => (
              <li key={p.idPlato} className="flex justify-between mb-1">
                <span>
                  {p.nombre} x {p.cantidad}
                </span>

                <div>
                  <button
                    onClick={() => quitarDelCarrito(p)}
                    className="bg-red-500 text-white px-2 py-0.5 rounded mr-2"
                  >
                    -
                  </button>

                  <button
                    onClick={() => agregarAlCarrito(p)}
                    className="bg-green-500 text-white px-2 py-0.5 rounded"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={guardarPedido}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Guardar Pedido
          </button>
        </div>
      )}
    </div>
  );
}
