import { useState } from "react";

export default function CrearMesaModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    numero: "",
    capacidad: "",
    estado: "Disponible"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    if (!form.numero || !form.capacidad) {
      alert("Todos los campos son obligatorios");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Crear Mesa</h2>

        <label className="text-sm">Número</label>
        <input
          name="numero"
          type="number"
          value={form.numero}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-3"
        />

        <label className="text-sm">Capacidad</label>
        <input
          name="capacidad"
          type="number"
          value={form.capacidad}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mb-3"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
        </div>
      </div>
    </div>
  );
}
