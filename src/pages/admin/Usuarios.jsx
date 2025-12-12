import { useEffect, useState } from "react";
import { Search, UserPlus, Edit, Trash2, RefreshCw, X } from "lucide-react";
import { usuarioService } from "../../services/usuarioService";
import UsuarioForm from "../../components/UsuarioForm";
import Swal from "sweetalert2";

export default function Usuarios() {

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [modalOpen, setModalOpen] = useState(false); // para abrir/cerrar modal

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalOpen(true);
  };


  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    Swal.fire({
      title: `¿Eliminar usuario ${nombre}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await usuarioService.eliminar(id);
          setUsuarios(usuarios.filter(u => u.idUsuario !== id));

          Swal.fire({
            icon: "success",
            title: "Usuario eliminado",
            text: "El usuario fue eliminado correctamente.",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el usuario: " + err.message,
          });
        }
      }
    });
  };
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchSearch =
      usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.telefono?.includes(searchTerm);

    const matchEstado = filtroEstado === "Todos" || usuario.estado === filtroEstado;

    return matchSearch && matchEstado;
  });

  const getEstadoBadge = (estado) => {
    return estado === "Activo"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar usuarios</p>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={cargarUsuarios}
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600">
          Administra los usuarios del sistema ({usuarios.length} total)
        </p>
      </div>

      {/* Filtros y botones */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>

            <button
              onClick={cargarUsuarios}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus size={18} />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.idUsuario} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nombre} {usuario.apellido || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {usuario.correo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {usuario.telefono}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {usuario.rol?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(usuario.estado)}`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(usuario.fechaRegistro).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditar(usuario)}
                          className="text-blue-600 hover:text-blue-800 transition p-1"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => handleEliminar(usuario.idUsuario, usuario.nombre)}
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

      {usuariosFiltrados.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
        </div>
      )}

      {/* Modal de creación */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <UsuarioForm
              usuario={usuarioSeleccionado} // PASAMOS el usuario a editar
              onClose={() => setModalOpen(false)}
              onSave={cargarUsuarios} // recarga la tabla
            />

          </div>
        </div>
      )}
    </div>
  );
}
