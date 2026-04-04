import { useEffect, useState } from "react";
import { Search, UserPlus, Edit, RefreshCw } from "lucide-react";
import { platosService } from "../../services/platosService";
import PlatoForm from "../../components/PlatoForm";
import Swal from "sweetalert2";

const LABELS = {
  nombre:      "Nombre",
  precio:      "Precio",
  descripcion: "Descripción",
  imagen:      "Imagen",
};

export default function Productos() {
  const [platos,           setPlatos]          = useState([]);
  const [loading,          setLoading]         = useState(true);
  const [error,            setError]           = useState(null);
  const [searchTerm,       setSearchTerm]      = useState("");
  const [filtroCategoria,  setFiltroCategoria] = useState("Todos");
  const [filtroEstado,     setFiltroEstado]    = useState("Todos");
  const [modalOpen,        setModalOpen]       = useState(false);
  const [platoEdit,        setPlatoEdit]       = useState(null);

  useEffect(() => { cargarPlatos(); }, []);

  const cargarPlatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await platosService.listar();
      setPlatos(data);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar platos:", err);
    } finally {
      setLoading(false);
    }
  };

  const abrirCrear  = () => { setPlatoEdit(null); setModalOpen(true); };
  const abrirEditar = (plato) => { setPlatoEdit(plato); setModalOpen(true); };
  const cerrarModal = () => { setModalOpen(false); setPlatoEdit(null); };

  const handleGuardado = (platoAntes, platoDespues) => {
    cargarPlatos();

    if (!platoAntes) {
      Swal.fire({
        icon: "success",
        title: "Plato creado",
        html: `
          <div style="text-align:left; font-size:14px; line-height:2">
            <b>Nombre:</b> ${platoDespues.nombre}<br/>
            <b>Precio:</b> $${platoDespues.precio}<br/>
            <b>Categoría:</b> ${platoDespues.categoriaPlato?.nombre || "—"}<br/>
            ${platoDespues.descripcion ? `<b>Descripción:</b> ${platoDespues.descripcion}<br/>` : ""}
          </div>
        `,
        confirmButtonColor: "#2563eb",
      });
    } else {
      const cambios = [];
      Object.keys(LABELS).forEach(key => {
        const antes   = platoAntes[key]   || "—";
        const despues = platoDespues[key] || "—";
        if (String(antes) !== String(despues))
          cambios.push(`<b>${LABELS[key]}:</b> ${antes} → ${despues}`);
      });

      if (platoAntes.categoriaPlato?.nombre !== platoDespues.categoriaPlato?.nombre)
        cambios.push(`<b>Categoría:</b> ${platoAntes.categoriaPlato?.nombre || "—"} → ${platoDespues.categoriaPlato?.nombre || "—"}`);

      if (platoAntes.estado !== platoDespues.estado)
        cambios.push(`<b>Estado:</b> ${platoAntes.estado === false ? "Inactivo" : "Activo"} → ${platoDespues.estado === false ? "Inactivo" : "Activo"}`);

      Swal.fire({
        icon: "success",
        title: "Plato actualizado",
        html: cambios.length > 0
          ? `<div style="text-align:left; font-size:14px; line-height:2">${cambios.join("<br/>")}</div>`
          : `<p style="font-size:14px; color:#6b7280">No se detectaron cambios.</p>`,
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const platosFiltrados = platos.filter(plato => {
    const matchSearch =
      plato.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plato.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plato.categoriaPlato?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategoria =
      filtroCategoria === "Todos" || plato.categoriaPlato?.nombre === filtroCategoria;

  const matchEstado =
    filtroEstado === "Todos" ||
    (filtroEstado === "Activos"   && plato.estado !== false) ||
    (filtroEstado === "Inactivos" && plato.estado === false);

    return matchSearch && matchCategoria && matchEstado;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex items-center gap-3 text-gray-400 text-sm">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        Cargando platos…
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-semibold mb-1">Error al cargar platos</p>
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button
          onClick={cargarPlatos}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Administración</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Platos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{platos.length} platos registrados</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm px-5 py-4 mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o categoría…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-600"
            >
              <option value="Todos">Todas las categorías</option>
              {platos
                .map(p => p.categoriaPlato?.nombre)
                .filter((v, i, a) => v && a.indexOf(v) === i)
                .map((categoria, idx) => (
                  <option key={idx} value={categoria}>{categoria}</option>
                ))}
            </select>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-600"
            >
              <option value="Todos">Todos</option>
              <option value="Activos">Solo activos</option>
              <option value="Inactivos">Solo inactivos</option>
            </select>
            <button
              onClick={cargarPlatos}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw size={15} /> Actualizar
            </button>
            <button
              onClick={abrirCrear}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
            >
              <UserPlus size={15} /> Nuevo plato
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Nombre", "Precio", "Descripción", "Categoría", "Imagen", "Estado", "Acciones"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {platosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                      <div className="text-3xl mb-2">🍽️</div>
                      {searchTerm
                        ? "No se encontraron platos con esa búsqueda"
                        : filtroEstado === "Inactivos"
                          ? "No hay platos inactivos"
                          : "No hay platos registrados"}
                    </td>
                  </tr>
                ) : platosFiltrados.map(plato => (
                  <tr
                    key={plato.idPlato}
                    className={`hover:bg-gray-50 transition-colors ${plato.estado === false ? "opacity-60" : ""}`}
                  >
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{plato.nombre}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">${plato.precio}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap max-w-xs truncate">{plato.descripcion || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{plato.categoriaPlato?.nombre || "—"}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {plato.imagen
                        ? <img src={plato.imagen} alt={plato.nombre} className="h-10 w-10 object-cover rounded-md" />
                        : <span className="text-gray-400 text-sm">—</span>}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${plato.estado === false
                          ? "bg-gray-100 text-gray-500"
                          : "bg-green-100 text-green-700"}`}>
                        {plato.estado === false ? "Inactivo" : "Activo"}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button
                        onClick={() => abrirEditar(plato)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
                        title="Editar"
                      >
                        <Edit size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {platosFiltrados.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                Mostrando {platosFiltrados.length} de {platos.length} platos
              </p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <PlatoForm
          plato={platoEdit}
          onClose={cerrarModal}
          onSave={(platoAntes, platoDespues) => {
            handleGuardado(platoAntes, platoDespues);
            cerrarModal();
          }}
        />
      )}
    </div>
  );
}