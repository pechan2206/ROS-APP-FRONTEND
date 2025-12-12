import { useEffect, useState } from "react";
import { Search, UserPlus, Edit, Trash2, RefreshCw } from "lucide-react";
import { clienteService } from "../../services/clienteService";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteService.listar();
      setClientes(data);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar al cliente ${nombre}?`)) {
      try {
        await clienteService.eliminar(id);
        setClientes(clientes.filter(c => c.idCliente !== id));
        alert("Cliente eliminado exitosamente");
      } catch (err) {
        alert("Error al eliminar cliente: " + err.message);
      }
    }
  };

  const clientesFiltrados = clientes.filter(cliente => {
    return (
      cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono?.includes(searchTerm) ||
      cliente.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar clientes</p>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={cargarClientes}
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestión de Clientes</h1>
        <p className="text-gray-600">
          Administra los clientes del sistema ({clientes.length} total)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, teléfono, dirección o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={cargarClientes}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus size={18} />
              Nuevo Cliente
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No se encontraron clientes</td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.idCliente} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cliente.telefono}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cliente.correo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cliente.direccion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cliente.descripcion || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(cliente.fechaRegistro).toLocaleDateString('es-CO')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 transition p-1" title="Editar">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleEliminar(cliente.idCliente, cliente.nombre)}
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

      {clientesFiltrados.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Mostrando {clientesFiltrados.length} de {clientes.length} clientes
        </div>
      )}
    </div>
  );
}
