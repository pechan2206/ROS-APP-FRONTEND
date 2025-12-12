const API_URL = "http://localhost:8080/api/proveedores";

export const proveedorService = {
  listar: async () => {
    const res = await fetch(API_URL);
    return res.json();
  },

  obtenerPorId: async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    return res.json();
  },

  guardar: async (proveedor) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proveedor),
    });

    if (!res.ok) {
      let errorMessage = "Error desconocido";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch {
        errorMessage = await res.text();
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },

  actualizar: async (id, proveedor) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proveedor),
    });
    return res.json();
  },

  eliminar: async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
  },
};
