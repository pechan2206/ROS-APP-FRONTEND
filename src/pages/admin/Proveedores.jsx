import { useEffect, useState } from "react";
import { Search, UserPlus, Edit, Trash2, RefreshCw } from "lucide-react";
import { proveedorService } from "../../services/proveedorService";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proveedorService.listar();
      setProveedores(data);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar proveedores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar al proveedor ${nombre}?`)) {
      try {
        await proveedorService.eliminar(id);
        setProveedores(proveedores.filter(p => p.idProveedor !== id));
        alert("Proveedor eliminado exitosamente");
      } catch (err) {
        alert("Error al eliminar proveedor: " + err.message);
      }
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefono?.includes(searchTerm) ||
    p.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar proveedores</p>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={cargarProveedores}
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestión de Proveedores</h1>
        <p className="text-gray-600">
          Administra los proveedores del sistema ({proveedores.length} total)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, teléfono o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={cargarProveedores}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus size={18} />
              Nuevo Proveedor
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {proveedoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No se encontraron proveedores</td>
                </tr>
              ) : (
                proveedoresFiltrados.map((p) => (
                  <tr key={p.idProveedor} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.telefono || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.correo || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.direccion || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 transition p-1" title="Editar">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleEliminar(p.idProveedor, p.nombre)}
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

      {proveedoresFiltrados.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Mostrando {proveedoresFiltrados.length} de {proveedores.length} proveedores
        </div>
      )}
    </div>
  );
}
