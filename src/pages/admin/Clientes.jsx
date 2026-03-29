// Clientes.jsx — Gestión de clientes con modal de crear/editar

import { useEffect, useState } from "react";
import { Search, UserPlus, Edit, Trash2, RefreshCw } from "lucide-react";
import { clienteService } from "../../services/clienteService";
import ClienteForm from "../../components/ClienteForm";

export default function Clientes() {
  const [clientes,    setClientes]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [modalOpen,   setModalOpen]   = useState(false);
  const [clienteEdit, setClienteEdit] = useState(null); // null = crear, objeto = editar

  useEffect(() => { cargarClientes(); }, []);

  const cargarClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteService.listar();
      setClientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirCrear  = () => { setClienteEdit(null); setModalOpen(true); };
  const abrirEditar = (cliente) => { setClienteEdit(cliente); setModalOpen(true); };
  const cerrarModal = () => { setModalOpen(false); setClienteEdit(null); };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar al cliente ${nombre}?`)) return;
    try {
      await clienteService.eliminar(id);
      setClientes(prev => prev.filter(c => c.idCliente !== id));
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono?.includes(searchTerm) ||
    c.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Cargando clientes…
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-semibold mb-1">Error al cargar clientes</p>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button onClick={cargarClientes} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Administración</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clientes.length} clientes registrados</p>
        </div>

        {/* Barra de búsqueda + acciones */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm px-5 py-4 mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, teléfono…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={cargarClientes}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw size={15} /> Actualizar
            </button>
            <button
              onClick={abrirCrear}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
            >
              <UserPlus size={15} /> Nuevo cliente
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Nombre", "Teléfono", "Correo", "Dirección", "Descripción", "Fecha registro", "Acciones"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                      <div className="text-3xl mb-2">👤</div>
                      {searchTerm ? "No se encontraron clientes con esa búsqueda" : "No hay clientes registrados"}
                    </td>
                  </tr>
                ) : clientesFiltrados.map(cliente => (
                  <tr key={cliente.idCliente} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{cliente.nombre}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{cliente.telefono}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{cliente.correo || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{cliente.direccion || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap max-w-xs truncate">{cliente.descripcion || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {cliente.fechaRegistro
                        ? new Date(cliente.fechaRegistro).toLocaleDateString("es-CO")
                        : "—"}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => abrirEditar(cliente)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
                          title="Editar"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleEliminar(cliente.idCliente, cliente.nombre)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer tabla */}
          {clientesFiltrados.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                Mostrando {clientesFiltrados.length} de {clientes.length} clientes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear/editar */}
      {modalOpen && (
        <ClienteForm
          cliente={clienteEdit}
          onClose={cerrarModal}
          onSave={cargarClientes}
        />
      )}
    </div>
  );
}