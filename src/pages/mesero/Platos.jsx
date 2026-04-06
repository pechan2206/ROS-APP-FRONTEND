// Platos.jsx — Pantalla para agregar platos a un pedido
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { platosService } from "../../services/platosService";
import { categoriaPlatoService } from "../../services/categoriaPlatoService";
import { detallePedidoService } from "../../services/detallePedidoService";
import { UtensilsCrossed, ShoppingCart, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const formatCOP = (n) => "$" + Number(n).toLocaleString("es-CO");

function Btn({ children, onClick, variant = "primary", small, fullWidth, disabled }) {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const size = small ? "text-xs px-2.5 py-1.5" : "text-sm px-4 py-2";
  const full = fullWidth ? "w-full justify-center" : "";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    gray: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${size} ${full} ${variants[variant] || variants.primary}`}>
      {children}
    </button>
  );
}

function PlatoCard({ plato, cantidadEnCarrito, onAgregar, onQuitar }) {
  const en = cantidadEnCarrito > 0;
  return (
    <div className={`flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-200 ${en ? "border-2 border-blue-500 ring-2 ring-blue-100 shadow-md" : "border border-gray-200 shadow-sm hover:shadow-md"}`}>
      <div
        className="h-24 flex items-center justify-center border-b border-gray-100 bg-gray-50 shrink-0"
        style={plato.imagen ? { backgroundImage: `url(${plato.imagen})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        {!plato.imagen && <UtensilsCrossed size={32} className="text-gray-400" strokeWidth={1.5} />}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-bold text-gray-800 leading-tight">{plato.nombre}</p>
        {plato.descripcion && (
          <p className="text-xs text-gray-500 leading-snug line-clamp-2">{plato.descripcion}</p>
        )}
        {plato.categoriaPlato?.nombre && (
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full w-fit">
            {plato.categoriaPlato.nombre}
          </span>
        )}
        <p className="text-base font-bold text-gray-800 mt-auto pt-1">{formatCOP(plato.precio)}</p>
      </div>
      <div className="px-3 py-2.5 border-t border-gray-100 bg-gray-50">
        {en ? (
          <div className="flex items-center justify-between">
            <button
              onClick={() => onQuitar(plato)}
              className="w-7 h-7 rounded-lg border border-gray-300 bg-white text-red-500 font-bold text-base flex items-center justify-center hover:bg-red-50 hover:border-red-400 transition-all duration-100"
            >−</button>
            <span className="text-sm font-bold text-blue-600 min-w-6 text-center">{cantidadEnCarrito}</span>
            <button
              onClick={() => onAgregar(plato)}
              className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-base flex items-center justify-center hover:bg-blue-700 transition-colors duration-100"
            >+</button>
          </div>
        ) : (
          <button
            onClick={() => onAgregar(plato)}
            className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors duration-100"
          >+ Agregar</button>
        )}
      </div>
    </div>
  );
}

function CarritoRow({ item, onAgregar, onQuitar }) {
  return (
    <div className="flex items-center gap-2.5 py-2.5 border-b border-gray-100">
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.nombre}</p>
        <p className="text-xs text-gray-500">{formatCOP(item.precio)} c/u</p>
      </div>
      <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-lg p-0.5">
        <button
          onClick={() => onQuitar(item)}
          className="w-5 h-5 bg-transparent text-red-500 font-bold cursor-pointer rounded flex items-center justify-center hover:bg-red-50 transition-colors"
        >−</button>
        <span className="text-xs font-bold min-w-4 text-center text-gray-800">{item.cantidad}</span>
        <button
          onClick={() => onAgregar(item)}
          className="w-5 h-5 bg-transparent text-blue-600 font-bold cursor-pointer rounded flex items-center justify-center hover:bg-blue-50 transition-colors"
        >+</button>
      </div>
      <p className="text-sm font-bold text-gray-800 min-w-16 text-right">{formatCOP(Number(item.precio) * item.cantidad)}</p>
    </div>
  );
}

export default function Platos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dataPlatos, dataCategorias] = await Promise.all([
          platosService.listar(),
          categoriaPlatoService.listar(),
        ]);
        setPlatos(dataPlatos);
        setCategorias(dataCategorias);
      } catch (e) { console.error("Error al cargar:", e); }
      finally { setLoading(false); }
    };
    cargar();
  }, []);

  const platosFiltrados = platos.filter(p => {
    const matchCat = categoriaActiva === null || p.categoriaPlato?.idCategoria === categoriaActiva;
    const matchBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  const agregarAlCarrito = (plato) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.idPlato === plato.idPlato);
      if (existe) return prev.map(p => p.idPlato === plato.idPlato ? { ...p, cantidad: p.cantidad + 1 } : p);
      return [...prev, { ...plato, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (plato) => {
    setCarrito(prev =>
      prev.map(p => p.idPlato === plato.idPlato ? { ...p, cantidad: p.cantidad - 1 } : p)
        .filter(p => p.cantidad > 0)
    );
  };

  const cantidadEnCarrito = (idPlato) => carrito.find(p => p.idPlato === idPlato)?.cantidad || 0;
  const totalItems = carrito.reduce((s, p) => s + p.cantidad, 0);
  const subtotal = carrito.reduce((s, p) => s + Number(p.precio) * p.cantidad, 0);

  const guardarPedido = async () => {
    const confirm = await MySwal.fire({
      title: "¿Guardar pedido?",
      text: "Se agregarán los platos seleccionados al pedido",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;
    setGuardando(true);
    try {
      for (const p of carrito) {
        await detallePedidoService.crear({
          pedido: { idPedido: Number(id) },
          plato: { idPlato: p.idPlato },
          cantidad: p.cantidad,
          precioUnitario: p.precio,
          subtotal: Number(p.precio) * p.cantidad,
        });
      }
      await MySwal.fire({ icon: "success", title: "Pedido guardado", text: "Los productos fueron añadidos correctamente", timer: 1500, showConfirmButton: false });
      setCarrito([]);
      navigate("/mesero/pedidos");
    } catch (e) {
      console.error("Error:", e);
      MySwal.fire({ icon: "error", title: "Error", text: "Ocurrió un error al guardar el pedido" });
    } finally { setGuardando(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3 text-gray-500 text-sm">
      <Loader2 size={18} className="animate-spin text-blue-600" />
      Cargando productos…
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.5">Pedido #{id}</p>
          <h1 className="text-2xl font-bold text-gray-800 leading-none">Agregar platos</h1>
        </div>
        <Btn variant="gray" onClick={() => navigate("/mesero/pedidos")}>
          <ArrowLeft size={15} /> Volver a pedidos
        </Btn>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* CATÁLOGO */}
        <div>
          <div className="flex flex-col gap-3 mb-4">
            <input
              type="text"
              placeholder="Buscar plato…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-800 px-3.5 py-2.5 rounded-lg text-sm outline-none shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategoriaActiva(null)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 ${categoriaActiva === null ? "bg-gray-700 text-white border-gray-700" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              >
                Todas
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${categoriaActiva === null ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {platos.length}
                </span>
              </button>
              {categorias.map(cat => {
                const activo = categoriaActiva === cat.idCategoria;
                const cnt = platos.filter(p => p.categoriaPlato?.idCategoria === cat.idCategoria).length;
                return (
                  <button
                    key={cat.idCategoria}
                    onClick={() => setCategoriaActiva(activo ? null : cat.idCategoria)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 ${activo ? "bg-blue-600 text-white border-blue-600" : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"}`}
                  >
                    {cat.nombre}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activo ? "bg-white/25 text-white" : "bg-blue-100 text-blue-600"}`}>
                      {cnt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            {platosFiltrados.length === platos.length
              ? `${platos.length} platos disponibles`
              : `${platosFiltrados.length} de ${platos.length} platos`}
          </p>

          {platosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
              <UtensilsCrossed size={40} strokeWidth={1.5} className="text-gray-300" />
              <p className="font-semibold text-gray-600">Sin resultados</p>
              <p className="text-sm">No se encontraron platos con ese filtro</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-4">
              {platosFiltrados.map(p => (
                <PlatoCard
                  key={p.idPlato}
                  plato={p}
                  cantidadEnCarrito={cantidadEnCarrito(p.idPlato)}
                  onAgregar={agregarAlCarrito}
                  onQuitar={quitarDelCarrito}
                />
              ))}
            </div>
          )}
        </div>

        {/* CARRITO */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm sticky top-4 flex flex-col">
          <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.5">Resumen</p>
              <h2 className="text-lg font-bold text-gray-800">Carrito</h2>
            </div>
            {carrito.length > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-1 max-h-80">
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                <ShoppingCart size={32} strokeWidth={1.5} className="text-gray-300" />
                <p className="text-sm">Agrega platos al carrito</p>
              </div>
            ) : carrito.map(item => (
              <CarritoRow key={item.idPlato} item={item} onAgregar={agregarAlCarrito} onQuitar={quitarDelCarrito} />
            ))}
          </div>

          {carrito.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCOP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800 border-t border-gray-200 mt-1 pt-2.5">
                <span>Total</span>
                <span>{formatCOP(subtotal)}</span>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setCarrito([])}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-400 transition-all duration-150 flex items-center justify-center"
                >
                  <Trash2 size={15} />
                </button>
                <Btn variant="success" fullWidth onClick={guardarPedido} disabled={guardando}>
                  {guardando ? (
                    <><Loader2 size={14} className="animate-spin" /> Guardando…</>
                  ) : "Guardar pedido"}
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}