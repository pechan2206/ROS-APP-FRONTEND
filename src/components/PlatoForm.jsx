import { useState, useEffect } from "react";
import { platosService } from "../services/platosService";
import { Utensils, DollarSign, Folder, FileText, Image, X, AlertTriangle } from "lucide-react";

const LABELS = {
  nombre:      "Nombre",
  precio:      "Precio",
  descripcion: "Descripción",
  imagen:      "Imagen",
};

export default function PlatoForm({ plato, onClose, onSave }) {
  const esEdicion = !!plato?.idPlato;

  const [form,      setForm]      = useState({ nombre: "", precio: "", descripcion: "", imagen: "" });
  const [estado,    setEstado]    = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [idCategoria, setIdCategoria] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [errores,   setErrores]   = useState({});

  useEffect(() => {
    platosService.listarCategorias()
      .then(setCategorias)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (plato) {
      setForm({
        nombre:      plato.nombre      || "",
        precio:      plato.precio      || "",
        descripcion: plato.descripcion || "",
        imagen:      plato.imagen      || "",
      });
      setEstado(plato.estado ?? true);
      setIdCategoria(plato.categoriaPlato?.idCategoria || "");
    }
  }, [plato]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: "" }));
    if (error) setError(null);
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim())            e.nombre      = "El nombre es obligatorio.";
    if (!form.precio || Number(form.precio) <= 0) e.precio = "El precio debe ser mayor a 0.";
    if (!idCategoria)                   e.idCategoria = "Selecciona una categoría.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validar();
    if (Object.keys(ev).length > 0) { setErrores(ev); return; }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        estado,
        categoriaPlato: { idCategoria: Number(idCategoria) },
      };

      let resultado;
      if (esEdicion) {
        resultado = await platosService.actualizar(plato.idPlato, payload);
      } else {
        resultado = await platosService.crear(payload);
      }

      onSave(plato ?? null, resultado);
      onClose();
    } catch (err) {
      setError(err.response?.data?.mensaje || err.message || "Error al guardar el plato.");
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
              {esEdicion ? `Editando #${plato.idPlato}` : "Nuevo"}
            </p>
            <h2 className="text-xl font-bold text-gray-800">
              {esEdicion ? "Editar plato" : "Crear plato"}
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

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Utensils size={16} />
              </span>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Bandeja paisa"
                className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition
                  placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100
                  ${errores.nombre ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-blue-500"}`}
              />
            </div>
            {errores.nombre && <p className="text-xs text-red-500 mt-1 font-medium">{errores.nombre}</p>}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Precio <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <DollarSign size={16} />
              </span>
              <input
                type="number"
                name="precio"
                min="0"
                step="0.01"
                value={form.precio}
                onChange={handleChange}
                placeholder="Ej: 25000"
                className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition
                  placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100
                  ${errores.precio ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-blue-500"}`}
              />
            </div>
            {errores.precio && <p className="text-xs text-red-500 mt-1 font-medium">{errores.precio}</p>}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Folder size={16} />
              </span>
              <select
                value={idCategoria}
                onChange={e => { setIdCategoria(e.target.value); if (errores.idCategoria) setErrores(p => ({ ...p, idCategoria: "" })); }}
                className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition
                  focus:ring-2 focus:ring-blue-100
                  ${errores.idCategoria ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-blue-500"}`}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            {errores.idCategoria && <p className="text-xs text-red-500 mt-1 font-medium">{errores.idCategoria}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <FileText size={16} />
              </span>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción opcional del plato…"
                rows={3}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen (URL)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Image size={16} />
              </span>
              <input
                type="text"
                name="imagen"
                value={form.imagen}
                onChange={handleChange}
                placeholder="https://…"
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Estado */}
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
                esEdicion ? "Guardar cambios" : "Crear plato"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}