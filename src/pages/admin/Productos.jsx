import { useEffect, useState } from "react";
import { Search, UserPlus, Edit, Trash2, RefreshCw } from "lucide-react";
import {platosService} from "../../services/platosService";

export default function Productos() {
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");

  useEffect(() => {
    cargarPlatos();
  }, []);

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

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el plato ${nombre}?`)) {
      try {
        await platosService.eliminar(id);
        setPlatos(platos.filter(p => p.idPlato !== id));
        alert("Plato eliminado exitosamente");
      } catch (err) {
        alert("Error al eliminar plato: " + err.message);
      }
    }
  };

  const platosFiltrados = platos.filter(plato => {
    const matchSearch =
      plato.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plato.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plato.categoriaPlato?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategoria =
      filtroCategoria === "Todos" || plato.categoriaPlato?.nombre === filtroCategoria;

    return matchSearch && matchCategoria;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Cargando platos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar platos</p>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={cargarPlatos}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestión de Platos</h1>
        <p className="text-gray-600">
          Administra los platos del sistema ({platos.length} total)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Todos">Todas las categorías</option>
              {platos
                .map(p => p.categoriaPlato?.nombre)
                .filter((v, i, a) => v && a.indexOf(v) === i)
                .map((categoria, idx) => (
                  <option key={idx} value={categoria}>{categoria}</option>
                ))}
            </select>

            <button
              onClick={cargarPlatos}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus size={18} />
              Nuevo Plato
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Imagen</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {platosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No se encontraron platos</td>
                </tr>
              ) : (
                platosFiltrados.map((plato) => (
                  <tr key={plato.idPlato} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plato.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${plato.precio}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plato.descripcion || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plato.categoriaPlato?.nombre || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {plato.imagen ? <img src={plato.imagen} alt={plato.nombre} className="h-10 w-10 object-cover rounded-md" /> : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 transition p-1" title="Editar">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleEliminar(plato.idPlato, plato.nombre)}
                          className="text-red-600 hover:text-red-800 transition p-1"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {platosFiltrados.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Mostrando {platosFiltrados.length} de {platos.length} platos
        </div>
      )}
    </div>
  );
}
