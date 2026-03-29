import { useState } from "react";
import { X, UtensilsCrossed, AlertCircle } from "lucide-react";

const ESTADOS = ["Disponible", "Ocupada", "Reservada"];

const estadoConfig = {
  Disponible: { color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-300" },
  Ocupada:    { color: "bg-red-500",     text: "text-red-700",     bg: "bg-red-50 border-red-300"         },
  Reservada:  { color: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-300"     },
};

export default function MesaModal({ mesa, onClose, onSave }) {
  const [form, setForm] = useState({
    idMesa:    mesa?.idMesa    || null,
    numero:    mesa?.numero    || "",
    capacidad: mesa?.capacidad || "",
    estado:    mesa?.estado    || "Disponible",
  });
  const [error, setError] = useState(null);       // ← nuevo
  const [saving, setSaving] = useState(false);    // ← nuevo

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null); // limpiar error al escribir
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.numero) {
      setError("El número de mesa es obligatorio");
      return;
    }
    if (!form.capacidad || form.capacidad <= 0) {
      setError("La capacidad debe ser mayor a 0");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      // Captura el mensaje del backend
      const mensaje = err?.response?.data?.mensaje || "Error al guardar la mesa";
      setError(mensaje);
    } finally {
      setSaving(false);
    }
  };

  const esEditar = !!form.idMesa;
  const config   = estadoConfig[form.estado] || estadoConfig.Disponible;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-xl">
              <UtensilsCrossed size={18} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {esEditar ? `Editar Mesa ${form.numero}` : "Nueva Mesa"}
              </h2>
              <p className="text-xs text-gray-400">
                {esEditar ? "Modifica los datos de la mesa" : "Completa los datos para registrar"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Banner de error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Número */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Número de mesa
            </label>
            <input
              type="number"
              name="numero"
              value={form.numero}
              onChange={handleChange}
              disabled={esEditar}
              placeholder="Ej: 5"
              className={`
                w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition
                ${error && !form.numero
                  ? "border-red-300 focus:ring-red-300"
                  : "border-gray-200 focus:ring-blue-400"}
                disabled:bg-gray-50 disabled:text-gray-400
              `}
            />
            {esEditar && (
              <p className="text-xs text-gray-400 mt-1">El número no se puede modificar</p>
            )}
          </div>

          {/* Capacidad */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Capacidad
            </label>
            <input
              type="number"
              name="capacidad"
              value={form.capacidad}
              onChange={handleChange}
              placeholder="Ej: 4"
              min={1}
              max={20}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Estado
            </label>
            <div className="flex gap-2">
              {ESTADOS.map((e) => {
                const cfg = estadoConfig[e];
                const activo = form.estado === e;
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setForm({ ...form, estado: e })}
                    className={`
                      flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200
                      ${activo
                        ? `${cfg.bg} ${cfg.text} border-current`
                        : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"}
                    `}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className={`rounded-xl border-2 p-3 flex items-center gap-3 transition-all ${config.bg}`}>
            <div className={`w-3 h-3 rounded-full ${config.color}`} />
            <span className={`text-sm font-semibold ${config.text}`}>
              Mesa {form.numero || "—"} · {form.capacidad || "—"} personas · {form.estado}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-sm transition shadow-md"
          >
            {saving ? "Guardando..." : esEditar ? "Guardar cambios" : "Crear mesa"}
          </button>
        </div>
      </div>
    </div>
  );
}