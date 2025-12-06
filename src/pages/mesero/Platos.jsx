    import { useState, useEffect } from "react";
    import { useNavigate, useParams } from "react-router-dom";
    import { platosService } from "../../services/platosService";
    import { detallePedidoService } from "../../services/detallePedidoService";

    export default function Platos() {
        const { id } = useParams();
        const [productos, setProductos] = useState([]);
        const [loading, setLoading] = useState(true);
        const [carrito, setCarrito] = useState([]);
        const navigate = useNavigate();
        
        useEffect(() => {
            const cargarProductos = async () => {
                try {
                    const data = await platosService.listar();
                    // Validamos que todos tengan idProducto
                    const dataConId = data.map((p, index) => ({
                        ...p,
                        idProducto: p.idProducto ?? index + 1,
                    }));
                    setProductos(dataConId);
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
                const existe = prev.find((p) => p.idProducto === producto.idProducto);
                if (existe) {
                    return prev.map((p) =>
                        p.idProducto === producto.idProducto
                            ? { ...p, cantidad: p.cantidad + 1 }
                            : p
                    );
                } else {
                    // Creamos un nuevo objeto independiente
                    return [...prev, { ...producto, cantidad: 1 }];
                }
            });
        };

        const quitarDelCarrito = (producto) => {
            setCarrito((prev) =>
                prev
                    .map((p) =>
                        p.idProducto === producto.idProducto
                            ? { ...p, cantidad: p.cantidad - 1 }
                            : p
                    )
                    .filter((p) => p.cantidad > 0)
            );
        };
        const guardarPedido = async () => {
            try {
                for (const p of carrito) {
                    await detallePedidoService.crear({
                        pedido: { idPedido: Number(id) },       // objeto pedido
                        plato: { idPlato: p.idProducto },      // objeto plato
                        cantidad: p.cantidad,
                        precio: p.precio,
                    });
                }
                alert("Pedido guardado con éxito!");
                setCarrito([]); // vaciar carrito
                navigate("/mesero/pedidos");
            } catch (error) {
                console.error("Error al guardar pedido:", error);
                alert("Ocurrió un error al guardar el pedido.");
            }
        };



        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Menú - Pedido #{id}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {productos.map((p) => (
                        <div key={p.idProducto} className="border rounded p-4 shadow">
                            <h2 className="font-bold text-lg">{p.nombre}</h2>
                            <p>Precio: ${p.precio}</p>
                            <button
                                onClick={() => agregarAlCarrito(p)}
                                className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
                            >
                                Agregar
                            </button>
                        </div>
                    ))}
                </div>

                {carrito.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <h2 className="text-xl font-bold mb-2">Carrito</h2>
                        <ul>
                            {carrito.map((p) => (
                                <li key={p.idProducto} className="flex justify-between mb-1">
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
