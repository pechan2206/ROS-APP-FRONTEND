const API_URL = "http://localhost:8080/api/clientes";

export const clienteService = {
    listar: async () => {
        const res = await fetch(API_URL);
        return res.json();
    },

    obtenerPorId: async (id) => {
        const res = await fetch(`${API_URL}/${id}`);
        return res.json();
    },

    guardar: async (cliente) => {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente),
        });
        return res.json();
    },

    actualizar: async (id, cliente) => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente),
        });
        return res.json();
    },

    eliminar: async (id) => {
        await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });
    },

    buscarPorNombre: async (nombre) => {
        const res = await fetch(`${API_URL}/buscar?nombre=${encodeURIComponent(nombre)}`);
        return res.json();
    },

    buscarPorTelefono: async (telefono) => {
        const res = await fetch(`${API_URL}/buscar-telefono?telefono=${telefono}`);
        return res.json();
    }

};


