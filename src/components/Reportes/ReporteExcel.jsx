import { useState } from "react";
import * as XLSX from "xlsx";
import { usuarioService } from "../../services/usuarioService";
import { proveedorService } from "../../services/proveedorService";
import { platosService } from "../../services/platosService";
import { clienteService } from "../../services/clienteService";

const OPCIONES = [
  { id: "usuarios",    label: "Usuarios",    emoji: "", color: "#4bc0c0" },
  { id: "proveedores", label: "Proveedores", emoji: "", color: "#ff9f40" },
  { id: "productos",   label: "Productos",   emoji: "", color: "#ffce56" },
  { id: "clientes",    label: "Clientes",    emoji: "", color: "#36a2eb" },
];

const obtenerDatos = async (tipo) => {
  switch (tipo) {
    case "usuarios":    return await usuarioService.listar();
    case "proveedores": return await proveedorService.listar();
    case "productos":   return await platosService.listar();
    case "clientes":    return await clienteService.listarTodos();
    default: return [];
  }
};

const mapearDatos = (tipo, datos) => {
  switch (tipo) {
    case "usuarios":
      return datos.map(u => ({
        "ID":       u.idUsuario,
        "Nombre":   u.nombre,
        "Correo":   u.correo   || "—",
        "Teléfono": u.telefono || "—",
        "Rol":      u.rol?.nombre || "—",
        "Estado":   u.estado === false ? "Inactivo" : "Activo",
      }));
    case "proveedores":
      return datos.map(p => ({
        "ID":        p.idProveedor,
        "Nombre":    p.nombre,
        "Teléfono":  p.telefono  || "—",
        "Correo":    p.correo    || "—",
        "Dirección": p.direccion || "—",
        "Estado":    p.estado === false ? "Inactivo" : "Activo",
      }));
    case "productos":
      return datos.map(p => ({
        "ID":          p.idPlato,
        "Nombre":      p.nombre,
        "Precio":      p.precio,
        "Categoría":   p.categoriaPlato?.nombre || "—",
        "Descripción": p.descripcion || "—",
        "Estado":      p.estado === false ? "Inactivo" : "Activo",
      }));
    case "clientes":
      return datos.map(c => ({
        "ID":             c.idCliente,
        "Nombre":         c.nombre,
        "Teléfono":       c.telefono    || "—",
        "Correo":         c.correo      || "—",
        "Dirección":      c.direccion   || "—",
        "Notas":          c.descripcion || "—",
        "Fecha registro": c.fechaRegistro
          ? new Date(c.fechaRegistro).toLocaleDateString("es-CO")
          : "—",
        "Estado":         c.estado === false ? "Inactivo" : "Activo",
      }));
    default: return datos;
  }
};

export default function ReporteExcel() {
  const [seleccionados, setSeleccionados] = useState([]);
  const [filtroEstado,  setFiltroEstado]  = useState("Todos");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  const toggleOpcion = (id) => {
    setError(null);
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const generarExcel = async () => {
    if (seleccionados.length === 0) {
      setError("Selecciona al menos una categoría.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const wb = XLSX.utils.book_new();

      for (const tipo of seleccionados) {
        let datos = await obtenerDatos(tipo);

        if (filtroEstado === "Activos") {
          datos = datos.filter(d => d.estado !== false);
        } else if (filtroEstado === "Inactivos") {
          datos = datos.filter(d => d.estado === false);
        }

        const filas = mapearDatos(tipo, datos);

        if (filas.length === 0) {
          // Hoja vacía con encabezado indicativo
          const ws = XLSX.utils.aoa_to_sheet([["Sin datos para el filtro seleccionado"]]);
          XLSX.utils.book_append_sheet(wb, ws, OPCIONES.find(o => o.id === tipo)?.label || tipo);
          continue;
        }

        const ws   = XLSX.utils.json_to_sheet(filas);
        const cols = Object.keys(filas[0]).map(key => ({
          wch: Math.max(key.length, ...filas.map(f => String(f[key] || "").length)) + 2,
        }));
        ws["!cols"] = cols;

        const nombreHoja = OPCIONES.find(o => o.id === tipo)?.label || tipo;
        XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
      }

      const fecha         = new Date().toLocaleDateString("es-CO").replace(/\//g, "-");
      const nombreArchivo = `Reporte_${fecha}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);

    } catch (err) {
      setError("Error al generar el reporte: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Selección */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          ¿Qué información deseas exportar?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {OPCIONES.map(op => {
            const activo = seleccionados.includes(op.id);
            return (
              <button
                key={op.id}
                onClick={() => toggleOpcion(op.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                  ${activo
                    ? "text-white border-transparent shadow-md"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                style={activo ? { backgroundColor: op.color, borderColor: op.color } : {}}
              >
                <span className="text-xl">{op.emoji}</span>
                {op.label}
                {activo && <span className="ml-auto">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro estado */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Filtrar por estado</p>
        <div className="flex gap-2">
          {["Todos", "Activos", "Inactivos"].map(op => (
            <button
              key={op}
              onClick={() => setFiltroEstado(op)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition
                ${filtroEstado === op
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          ⚠️ {error}
        </p>
      )}

      {/* Resumen */}
      {seleccionados.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600">
          Se exportará: <span className="font-semibold text-gray-800">
            {seleccionados.map(s => OPCIONES.find(o => o.id === s)?.label).join(", ")}
          </span>
          {" "}— Estado: <span className="font-semibold text-gray-800">{filtroEstado}</span>
          <br />
          <span className="text-xs text-gray-400">Cada categoría tendrá su propia hoja en el archivo Excel.</span>
        </div>
      )}

      {/* Botón */}
      <button
        onClick={generarExcel}
        disabled={loading || seleccionados.length === 0}
        className="w-full py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Generando Excel…
          </>
        ) : (
          <>Descargar Excel</>
        )}
      </button>
    </div>
  );
}