import { useEffect, useState } from "react";
import { enumService } from "../services/enumService";

export default function SelectTipoPedido({ value, onChange, label, name }) {
  const [opciones, setOpciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEnums = async () => {
      try {
        const data = await enumService.tipos(); // Ajusta según tu endpoint de enums
        setOpciones(data || []);
      } catch (error) {
        console.error("Error cargando enums:", error);
        setOpciones([]);
      } finally {
        setLoading(false);
      }
    };
    cargarEnums();
  }, []);

  if (loading) return <p>Cargando {label}...</p>;

  return (
    <div className="mb-3">
      {label && <label className="block mb-1 font-semibold">{label}</label>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="border w-full px-2 py-1 rounded"
      >
        <option value="">Selecciona {label}</option>
        {opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    </div>
  );
}
