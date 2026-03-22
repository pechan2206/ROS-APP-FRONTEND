// CrearCliente.jsx — Formulario de registro de cliente
// Diseño coherente con el resto del proyecto (Tailwind)

import { useState } from "react";
import { clienteService } from "../../services/clienteService";
import { useNavigate } from "react-router-dom";

const fields = [
  { name: "nombre",      label: "Nombre completo", placeholder: "Ej: María García",           type: "text",   required: true  },
  { name: "telefono",    label: "Teléfono",         placeholder: "Ej: 3001234567",             type: "tel",    required: true  },
  { name: "correo",      label: "Correo electrónico",placeholder: "Ej: maria@email.com",       type: "email",  required: true },
  { name: "direccion",   label: "Dirección",        placeholder: "Ej: Cra 10 #45-20",         type: "text",   required: true },
  { name: "descripcion", label: "Descripcion direccion",placeholder: "Ej: Torre 11 apto 601",   type: "text",  required: false },
];

export default function CrearCliente() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "", telefono: "", correo: "", direccion: "", descripcion: "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await clienteService.guardar(form);
      setSuccess(true);
      setTimeout(() => navigate("/mesero/pedidos"), 1200);
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-lg">

        {/* Encabezado */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium mb-4 transition"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Registrar cliente</h1>
          <p className="text-sm text-gray-500 mt-1">
            Completa los datos para agregar un nuevo cliente al sistema.
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl ring-1 ring-gray-300/60 overflow-hidden">

          {/* Banner éxito */}
          {success && (
            <div className="bg-green-50 border-b border-green-200 px-5 py-3 flex items-center gap-2 text-green-800 text-sm font-semibold">
              <span className="text-lg">✅</span> Cliente guardado. Redirigiendo…
            </div>
          )}

          {/* Banner error */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center gap-2 text-red-700 text-sm font-semibold">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}

          {/* Header de la card */}
          <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Nuevo</p>
            <h2 className="text-lg font-bold text-gray-800">Datos del cliente</h2>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

            {fields.map(({ name, label, placeholder, type, icon, required }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {label}
                  {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <div className="relative">
                  <input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    required={required}
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                      placeholder:text-gray-400"
                  />
                </div>
              </div>
            ))}

            {/* Separador */}
            <div className="border-t border-gray-100 pt-1" />

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 text-sm font-semibold text-gray-600 bg-white border border-gray-300
                  rounded-lg py-2 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold
                  bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 shadow-sm transition
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Guardando…
                  </>
                ) : (
                  "Guardar cliente"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Nota campos obligatorios */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          Los campos marcados con <span className="text-red-400">*</span> son obligatorios.
        </p>
      </div>
    </div>
  );
}