import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export default function MesaModal({ mesa, onClose, onSave }) {
  const [nombre, setNombre] = useState(mesa.nombre);
  const [capacidad, setCapacidad] = useState(mesa.capacidad);
  const [estado, setEstado] = useState(mesa.estado);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave({ ...mesa, nombre, capacidad, estado });
    onClose();
  };

  const estados = [
    { value: "libre", label: "Libre", color: "text-green-600" },
    { value: "ocupada", label: "Ocupada", color: "text-red-600" },
    { value: "otro", label: "Otro estado", color: "text-yellow-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 overflow-visible">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Editar mesa</h3>

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Capacidad</label>
            <input
              type="number"
              min="1"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dropdown personalizado */}
          <div className="relative">
            <label className="block text-sm text-gray-600 mb-1">Estado</label>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="w-full px-3 py-2 border rounded-lg flex items-center justify-between focus:ring-2 focus:ring-blue-500"
            >
              <span
                className={
                  estados.find((e) => e.value === estado)?.color || "text-gray-800"
                }
              >
                {estados.find((e) => e.value === estado)?.label}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>

            {open && (
              <div className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50">
                {estados.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => {
                      setEstado(e.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${e.color}`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
