import { useState, useEffect } from "react";
import { proveedorService } from "../services/proveedorService";

export default function ProveedorForm({ proveedor, onClose, onSave }) {
  const esEdicion = !!proveedor?.idProveedor;

  const [form,    setForm]    = useState({ nombre: "", telefono: "", correo: "", direccion: "" });
  const [estado,  setEstado]  = useState(true);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (proveedor) {
      setForm({
        nombre:    proveedor.nombre    || "",
        telefono:  proveedor.telefono  || "",
        correo:    proveedor.correo    || "",
        direccion: proveedor.direccion || "",
      });
      setEstado(proveedor.estado !== false);
    }
  }, [proveedor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: "" }));
    if (error) setError(null);
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim())   e.nombre   = "El nombre es obligatorio.";
    if (form.telefono && !/^3\d{9}$/.test(form.telefono)) e.telefono = "Debe iniciar con 3 y tener 10 dígitos.";
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = "Correo inválido.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validar();
    if (Object.keys(ev).length > 0) { setErrores(ev); return; }

    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, estado };
      let resultado;
      if (esEdicion) {
        resultado = await proveedorService.actualizar(proveedor.idProveedor, payload);
      } else {
        resultado = await proveedorService.guardar(payload);
      }
      onSave(proveedor ?? null, resultado);
      onClose();
    } catch (err) {
      setError(err.response?.data?.mensaje || err.message || "Error al guardar el proveedor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-2 border-gray-200 ring-1 ring-gray-300/60 overflow-hidden">

        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">
              {esEdicion ? `Editando #${proveedor.idProveedor}` : "Nuevo"}
            </p>
            <h2 className="text-xl font-bold text-gray-800">
              {esEdicion ? "Editar proveedor" : "Crear proveedor"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">🏭</span>
              <input
                type="text" name="nombre" value={form.nombre} onChange={handleChange}
                placeholder="Ej: Distribuidora Central"
                className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition
                  placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100
                  ${errores.nombre ? "border-red-400" : "border-gray-300 focus:border-blue-500"}`}
              />
            </div>
            {errores.nombre && <p className="text-xs text-red-500 mt-1 font-medium">{errores.nombre}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">📱</span>
              <input
                type="tel" name="telefono" value={form.telefono} onChange={handleChange}
                placeholder="Ej: 3001234567"
                className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition
                  placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100
                  ${errores.telefono ? "border-red-400" : "border-gray-300 focus:border-blue-500"}`}
              />
            </div>
            {errores.telefono && <p className="text-xs text-red-500 mt-1 font-medium">{errores.telefono}</p>}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Correo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">✉️</span>
              <input
                type="email" name="correo" value={form.correo} onChange={handleChange}
                placeholder="Ej: contacto@proveedor.com"
                className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition
                  placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100
                  ${errores.correo ? "border-red-400" : "border-gray-300 focus:border-blue-500"}`}
              />
            </div>
            {errores.correo && <p className="text-xs text-red-500 mt-1 font-medium">{errores.correo}</p>}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">📍</span>
              <input
                type="text" name="direccion" value={form.direccion} onChange={handleChange}
                placeholder="Ej: Cra 10 #45-20"
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Estado — solo en edición */}
          {esEdicion && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
              <select
                value={estado ? "true" : "false"}
                onChange={e => setEstado(e.target.value === "true")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Los campos marcados con <span className="text-red-400">*</span> son obligatorios.
          </p>

          <div className="flex gap-3 pt-1 border-t border-gray-100">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold
                bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Guardando…
                </>
              ) : (
                esEdicion ? "Guardar cambios" : "Crear proveedor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}