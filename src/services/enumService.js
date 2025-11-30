const API_URL = "http://localhost:8080/api/enums";

export const enumService = {
  estados: async () => {
    const res = await fetch(`${API_URL}/estado-pedido`);
    return res.json();
  },

  tipos: async () => {
    const res = await fetch(`${API_URL}/tipo-pedido`);
    return res.json();
  }
};
