import { useState, useEffect } from "react";
import { clienteService } from "../services/clienteService";
import { User, Phone, Mail, MapPin, FileText, X, AlertTriangle } from "lucide-react";

const FIELDS = [
  { name: "nombre",      label: "Nombre completo",   type: "text",  placeholder: "Ej: María García",         required: true,  icon: User },
  { name: "telefono",    label: "Teléfono",           type: "tel",   placeholder: "Ej: 3001234567",           required: true,  icon: Phone, pattern: "3\\d{9}", title: "Debe iniciar con 3 y tener 10 dígitos" },
  { name: "correo",      label: "Correo electrónico", type: "email", placeholder: "Ej: maria@email.com",     required: false, icon: Mail },
  { name: "direccion",   label: "Dirección",          type: "text",  placeholder: "Ej: Cra 10 #45-20",       required: false, icon: MapPin },
  { name: "descripcion", label: "Notas adicionales",  type: "text",  placeholder: "Alergias, preferencias…", required: false, icon: FileText },
];

const LABELS = {
  nombre:      "Nombre",
  telefono:    "Teléfono",
  correo:      "Correo",
  direccion:   "Dirección",
  descripcion: "Notas",
};

export default function ClienteForm({ cliente, onClose, onSave }) {
  const esEdicion = !!cliente?.idCliente;

  const [form,    setForm]    = useState({ nombre: "", telefono: "", correo: "", direccion: "", descripcion: "" });
  const [estado,  setEstado]  = useState(true);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (cliente) {
      setForm({
        nombre:      cliente.nombre      || "",
        telefono:    cliente.telefono    || "",
        correo:      cliente.correo      || "",
        direccion:   cliente.direccion   || "",
        descripcion: cliente.descripcion || "",
      });
      setEstado(cliente.estado ?? true);
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
    if (!form.nombre.trim())   e.nombre   = "El nombre es obligatorio.";
    if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio.";
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
      const payload = { ...form, estado };

      if (esEdicion) {
        await clienteService.actualizar(cliente.idCliente, payload);
      } else {
        await clienteService.guardar(payload);
      }

      onSave(cliente, payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.mensaje || err.message || "Error al guardar el cliente.");
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
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Banner error */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {FIELDS.map(({ name, label, type, placeholder, required, icon: Icon, pattern, title }) => (
            <div key={name}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon size={16} />
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
                    placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100
                    ${errores[name]
                      ? "border-red-400 focus:border-red-400"
                      : "border-gray-300 focus:border-blue-500"}`}
                />
              </div>
              {errores[name] && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errores[name]}</p>
              )}
            </div>
          ))}

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