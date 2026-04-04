import { useEffect, useState } from "react";
import { Search, UserPlus, Edit, RefreshCw } from "lucide-react";
import { proveedorService } from "../../services/proveedorService";
import ProveedorForm from "../../components/ProveedorForm";
import Swal from "sweetalert2";

const LABELS = {
  nombre:    "Nombre",
  telefono:  "Teléfono",
  correo:    "Correo",
  direccion: "Dirección",
};

export default function Proveedores() {
  const [proveedores,   setProveedores]  = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [error,         setError]        = useState(null);
  const [searchTerm,    setSearchTerm]   = useState("");
  const [filtroEstado,  setFiltroEstado] = useState("Todos");
  const [modalOpen,     setModalOpen]    = useState(false);
  const [proveedorEdit, setProveedorEdit]= useState(null);

  useEffect(() => { cargarProveedores(); }, []);

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

  const abrirCrear    = () => { setProveedorEdit(null); setModalOpen(true); };
  const abrirEditar   = (p) => { setProveedorEdit(p); setModalOpen(true); };
  const cerrarModal   = () => { setModalOpen(false); setProveedorEdit(null); };

  const handleGuardado = (antes, despues) => {
    cargarProveedores();

    if (!antes) {
      Swal.fire({
        icon: "success",
        title: "Proveedor creado",
        html: `
          <div style="text-align:left; font-size:14px; line-height:2">
            <b>Nombre:</b> ${despues.nombre}<br/>
            ${despues.telefono  ? `<b>Teléfono:</b> ${despues.telefono}<br/>`  : ""}
            ${despues.correo    ? `<b>Correo:</b> ${despues.correo}<br/>`      : ""}
            ${despues.direccion ? `<b>Dirección:</b> ${despues.direccion}<br/>`: ""}
          </div>
        `,
        confirmButtonColor: "#2563eb",
      });
    } else {
      const cambios = [];
      Object.keys(LABELS).forEach(key => {
        const a = antes[key]   || "—";
        const d = despues[key] || "—";
        if (a !== d) cambios.push(`<b>${LABELS[key]}:</b> ${a} → ${d}`);
      });

      if (antes.estado !== despues.estado)
        cambios.push(`<b>Estado:</b> ${antes.estado === false ? "Inactivo" : "Activo"} → ${despues.estado === false ? "Inactivo" : "Activo"}`);

      Swal.fire({
        icon: "success",
        title: "Proveedor actualizado",
        html: cambios.length > 0
          ? `<div style="text-align:left; font-size:14px; line-height:2">${cambios.join("<br/>")}</div>`
          : `<p style="font-size:14px; color:#6b7280">No se detectaron cambios.</p>`,
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => {
    const matchSearch =
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telefono?.includes(searchTerm) ||
      p.direccion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado =
      filtroEstado === "Todos" ||
      (filtroEstado === "Activos"   && p.estado !== false) ||
      (filtroEstado === "Inactivos" && p.estado === false);

    return matchSearch && matchEstado;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex items-center gap-3 text-gray-400 text-sm">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        Cargando proveedores…
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-semibold mb-1">Error al cargar proveedores</p>
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button
          onClick={cargarProveedores}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Proveedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">{proveedores.length} proveedores registrados</p>
        </div>

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
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
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
              onClick={cargarProveedores}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw size={15} /> Actualizar
            </button>
            <button
              onClick={abrirCrear}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
            >
              <UserPlus size={15} /> Nuevo proveedor
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Nombre", "Teléfono", "Correo", "Dirección", "Estado", "Acciones"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proveedoresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                      <div className="text-3xl mb-2">🏭</div>
                      {searchTerm
                        ? "No se encontraron proveedores con esa búsqueda"
                        : filtroEstado === "Inactivos"
                          ? "No hay proveedores inactivos"
                          : "No hay proveedores registrados"}
                    </td>
                  </tr>
                ) : proveedoresFiltrados.map(p => (
                  <tr
                    key={p.idProveedor}
                    className={`hover:bg-gray-50 transition-colors ${p.estado === false ? "opacity-60" : ""}`}
                  >
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{p.nombre}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{p.telefono || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{p.correo    || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{p.direccion || "—"}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${p.estado === false
                          ? "bg-gray-100 text-gray-500"
                          : "bg-green-100 text-green-700"}`}>
                        {p.estado === false ? "Inactivo" : "Activo"}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button
                        onClick={() => abrirEditar(p)}
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

          {proveedoresFiltrados.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                Mostrando {proveedoresFiltrados.length} de {proveedores.length} proveedores
              </p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <ProveedorForm
          proveedor={proveedorEdit}
          onClose={cerrarModal}
          onSave={(antes, despues) => {
            handleGuardado(antes, despues);
            cerrarModal();
          }}
        />
      )}
    </div>
  );
}