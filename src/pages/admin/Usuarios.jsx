import { useEffect, useState } from "react";
import { Search, UserPlus, Edit, RefreshCw, X } from "lucide-react";
import { usuarioService } from "../../services/usuarioService";
import UsuarioForm from "../../components/UsuarioForm";
import Swal from "sweetalert2";

export default function Usuarios() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarios, setUsuarios]                       = useState([]);
  const [loading, setLoading]                         = useState(true);
  const [error, setError]                             = useState(null);
  const [searchTerm, setSearchTerm]                   = useState("");
  const [filtroEstado, setFiltroEstado]               = useState("Todos");
  const [modalOpen, setModalOpen]                     = useState(false);

  useEffect(() => { cargarUsuarios(); }, []);

  const handleEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setUsuarioSeleccionado(null); // ← limpiar al cerrar
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ← alerta con resumen de cambios
  const handleGuardado = (usuarioAntes, usuarioDespues) => {
    cargarUsuarios();

    if (!usuarioAntes) {
      // Usuario nuevo
      Swal.fire({
        icon: "success",
        title: "Usuario creado",
        html: `
          <div style="text-align:left; font-size:14px; line-height:2">
            <b>Nombre:</b> ${usuarioDespues.nombre} ${usuarioDespues.apellido || ""}<br/>
            <b>Correo:</b> ${usuarioDespues.correo}<br/>
            <b>Teléfono:</b> ${usuarioDespues.telefono}<br/>
            <b>Estado:</b> ${usuarioDespues.estado}
          </div>
        `,
        confirmButtonColor: "#2563eb",
      });
    } else {
      // Edición — mostrar qué cambió
    const cambios = [];
    if (usuarioAntes.nombre    !== usuarioDespues.nombre)    cambios.push(`<b>Nombre:</b> ${usuarioAntes.nombre} → ${usuarioDespues.nombre}`);
    if (usuarioAntes.apellido  !== usuarioDespues.apellido)  cambios.push(`<b>Apellido:</b> ${usuarioAntes.apellido || "—"} → ${usuarioDespues.apellido || "—"}`);
    if (usuarioAntes.correo    !== usuarioDespues.correo)    cambios.push(`<b>Correo:</b> ${usuarioAntes.correo} → ${usuarioDespues.correo}`);
    if (usuarioAntes.telefono  !== usuarioDespues.telefono)  cambios.push(`<b>Teléfono:</b> ${usuarioAntes.telefono} → ${usuarioDespues.telefono}`);
    if (usuarioAntes.estado    !== usuarioDespues.estado)    cambios.push(`<b>Estado:</b> ${usuarioAntes.estado} → ${usuarioDespues.estado}`);
    if (usuarioAntes.rol?.idRol !== usuarioDespues.rol?.idRol)
      cambios.push(`<b>Rol:</b> ${usuarioAntes.rol?.nombre || "—"} → ${usuarioDespues.rolNombre || "—"}`);
    if (usuarioDespues.contrasena)                           // ← agregar esta línea
      cambios.push(`<b>Contraseña:</b> actualizada`);

      Swal.fire({
        icon: "success",
        title: `Usuario actualizado`,
        html: cambios.length > 0
          ? `<div style="text-align:left; font-size:14px; line-height:2">${cambios.join("<br/>")}</div>`
          : `<p style="font-size:14px; color:#6b7280">No se detectaron cambios visibles.</p>`,
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const matchSearch =
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.telefono?.includes(searchTerm);
    const matchEstado = filtroEstado === "Todos" || u.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const getEstadoBadge = (estado) =>
    estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
        <p className="text-gray-600">Cargando usuarios...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-semibold mb-2">Error al cargar usuarios</p>
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={cargarUsuarios} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-600">Administra los usuarios del sistema ({usuarios.length} total)</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
            <button onClick={cargarUsuarios} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2">
              <RefreshCw size={18} /> Actualizar
            </button>
            <button
              onClick={() => { setUsuarioSeleccionado(null); setModalOpen(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus size={18} /> Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Nombre Completo","Correo","Teléfono","Rol","Estado","Fecha Registro","Acciones"].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : usuariosFiltrados.map(usuario => (
                <tr key={usuario.idUsuario} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {usuario.nombre} {usuario.apellido || ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{usuario.correo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{usuario.telefono}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{usuario.rol?.nombre || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getEstadoBadge(usuario.estado)}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(usuario.fechaRegistro).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleEditar(usuario)}
                      className="text-blue-600 hover:text-blue-800 transition p-1"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {usuariosFiltrados.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button onClick={cerrarModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
            <UsuarioForm
              usuario={usuarioSeleccionado}
              onClose={cerrarModal}
              onSave={(usuarioDespues) => {         // ← recibe el usuario guardado
                handleGuardado(usuarioSeleccionado, usuarioDespues);
                cerrarModal();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}