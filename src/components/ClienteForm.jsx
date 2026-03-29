// ClienteForm.jsx — Modal para crear / editar un cliente
// Mismo estilo del proyecto (Tailwind) — coherente con UsuarioForm

import { useState, useEffect } from "react";
import { clienteService } from "../services/clienteService";

// ── Campos del formulario ──────────────────────────────────────────────────
const FIELDS = [
  { name: "nombre",      label: "Nombre completo", type: "text",  placeholder: "Ej: María García",      required: true,  icon: "👤" },
  { name: "telefono",    label: "Teléfono",         type: "tel",   placeholder: "Ej: 3001234567",        required: true,  icon: "📱", pattern: "3\\d{9}", title: "Debe iniciar con 3 y tener 10 dígitos" },
  { name: "correo",      label: "Correo electrónico",type: "email", placeholder: "Ej: maria@email.com",   required: false, icon: "✉️" },
  { name: "direccion",   label: "Dirección",         type: "text",  placeholder: "Ej: Cra 10 #45-20",    required: false, icon: "📍" },
  { name: "descripcion", label: "Notas adicionales", type: "text",  placeholder: "Alergias, preferencias…",required: false, icon: "📝" },
];

export default function ClienteForm({ cliente, onClose, onSave }) {
  const esEdicion = !!cliente?.idCliente;

  const [form, setForm]       = useState({ nombre: "", telefono: "", correo: "", direccion: "", descripcion: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [errores, setErrores] = useState({});

  // Precargar datos si es edición
  useEffect(() => {
    if (cliente) {
      setForm({
        nombre:      cliente.nombre      || "",
        telefono:    cliente.telefono    || "",
        correo:      cliente.correo      || "",
        direccion:   cliente.direccion   || "",
        descripcion: cliente.descripcion || "",
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: "" }));
    if (error) setError(null);
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim())    e.nombre   = "El nombre es obligatorio.";
    if (!form.telefono.trim())  e.telefono = "El teléfono es obligatorio.";
    else if (!/^3\d{9}$/.test(form.telefono)) e.telefono = "Debe iniciar con 3 y tener 10 dígitos.";
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
      if (esEdicion) {
        await clienteService.actualizar(cliente.idCliente, form);
      } else {
        await clienteService.guardar(form);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.mensaje || err.message || "Error al guardar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-2 border-gray-200 ring-1 ring-gray-300/60 overflow-hidden">

        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">
              {esEdicion ? `Editando #${cliente.idCliente}` : "Nuevo"}
            </p>
            <h2 className="text-xl font-bold text-gray-800">
              {esEdicion ? "Editar cliente" : "Crear cliente"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Banner error global */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {FIELDS.map(({ name, label, type, placeholder, required, icon, pattern, title }) => (
            <div key={name}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none select-none">
                  {icon}
                </span>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required={required}
                  pattern={pattern}
                  title={title}
                  className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition
                    placeholder:text-gray-400
                    focus:ring-2 focus:ring-blue-100
                    ${errores[name]
                      ? "border-red-400 focus:border-red-400"
                      : "border-gray-300 focus:border-blue-500"
                    }`}
                />
              </div>
              {errores[name] && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errores[name]}</p>
              )}
            </div>
          ))}

          {/* Nota campos obligatorios */}
          <p className="text-xs text-gray-400">
            Los campos marcados con <span className="text-red-400">*</span> son obligatorios.
          </p>

          {/* Acciones */}
          <div className="flex gap-3 pt-1 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
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
                esEdicion ? "Guardar cambios" : "Crear cliente"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}