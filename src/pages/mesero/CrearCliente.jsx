import { useState } from "react";
import { clienteService } from "../../services/clienteService";
import { useNavigate } from "react-router-dom";

export default function CrearCliente() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre: "",
        telefono: "",
        correo: "",
        direccion: "",
        descripcion: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await clienteService.guardar(form);

            // Exitoso → volver a pedidos o donde quieras
            navigate("/mesero/pedidos");
        } catch (err) {
            // Mostrar error del backend
            setError(err.message);
        }
    };

    return (
        <div className="p-5">
            <h2 className="text-xl font-bold mb-4">Registrar Cliente</h2>

            {error && (
                <p className="text-red-500 mb-3">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    name="nombre"
                    placeholder="Nombre"
                    className="border w-full px-2 py-1 rounded"
                    value={form.nombre}
                    onChange={handleChange}
                />

                <input
                    name="telefono"
                    placeholder="Teléfono"
                    className="border w-full px-2 py-1 rounded"
                    value={form.telefono}
                    onChange={handleChange}
                />

                <input
                    name="correo"
                    placeholder="Correo"
                    className="border w-full px-2 py-1 rounded"
                    value={form.correo}
                    onChange={handleChange}
                />

                <input
                    name="direccion"
                    placeholder="Dirección"
                    className="border w-full px-2 py-1 rounded"
                    value={form.direccion}
                    onChange={handleChange}
                />

                
                <input
                    name="descripcion"
                    placeholder="Descripcion"
                    className="border w-full px-2 py-1 rounded"
                    value={form.descripcion}
                    onChange={handleChange}
                />

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Guardar Cliente
                </button>
            </form>
        </div>
    );
}
