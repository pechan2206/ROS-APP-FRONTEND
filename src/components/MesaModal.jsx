import { useState } from "react";

export default function MesaModal({ mesa, onClose, onSave }) {
  const [form, setForm] = useState({
    idMesa: mesa?.idMesa || null,
    numero: mesa?.numero || "",
    capacidad: mesa?.capacidad || "",
    estado: mesa?.estado || "Disponible",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    if (!form.capacidad) {
      alert("La capacidad es obligatoria");
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          {form.idMesa ? "Editar Mesa" : "Crear Mesa"}
        </h2>

        {/* Número de mesa */}
        <div className="mb-4">
          <label className="text-sm">Número de mesa:</label>
          <input
            type="number"
            name="numero"
            value={form.numero}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            disabled={!!form.idMesa} // No se cambia si ya existe
          />
        </div>

        {/* Capacidad */}
        <div className="mb-4">
          <label className="text-sm">Capacidad:</label>
          <input
            type="number"
            name="capacidad"
            value={form.capacidad}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Estado */}
        <div className="mb-4">
          <label className="text-sm">Estado:</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
            <option value="Reservada">Reservada</option>
          </select>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
