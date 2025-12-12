// usuarioService.js

const API_URL = 'http://localhost:8080/api/usuarios';

/**
 * Obtiene el token JWT del localStorage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Verifica si el token existe y no ha expirado
 */
const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  try {
    // Decodificar el payload del JWT (parte central del token)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Verificar si el token ha expirado
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error al validar token:', error);
    return false;
  }
};

/**
 * Obtiene los headers con el token JWT
 */
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Maneja errores de las peticiones
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
    throw new Error(error.message || `Error: ${response.status}`);
  }
  
  // Si la respuesta está vacía (como en DELETE), retornar null
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return null;
  }
  
  return response.json();
};

/**
 * Servicio de Usuarios
 */
export const usuarioService = {
  /**
   * Listar todos los usuarios
   * GET /api/usuarios
   */
  listar: async () => {
    if (!isTokenValid()) {
      throw new Error('Token inválido o expirado');
    }

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      throw error;
    }
  },

  /**
   * Buscar usuario por ID
   * GET /api/usuarios/{id}
   */
  buscarPorId: async (id) => {
    if (!isTokenValid()) {
      throw new Error('Token inválido o expirado');
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error al buscar usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Guardar nuevo usuario
   * POST /api/usuarios
   */
  guardar: async (usuario) => {
    if (!isTokenValid()) {
      throw new Error('Token inválido o expirado');
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(usuario)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      throw error;
    }
  },

  /**
   * Actualizar usuario existente
   * PUT /api/usuarios/{id}
   */
  actualizar: async (id, usuario) => {
    if (!isTokenValid()) {
      throw new Error('Token inválido o expirado');
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(usuario)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar usuario
   * DELETE /api/usuarios/{id}
   */
  eliminar: async (id) => {
    if (!isTokenValid()) {
      throw new Error('Token inválido o expirado');
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error al eliminar usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Guardar el token JWT en localStorage
   */
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  /**
   * Eliminar el token JWT del localStorage
   */
  removeToken: () => {
    localStorage.removeItem('token');
  },

  /**
   * Obtener información del usuario desde el token
   */
  getUserFromToken: () => {
    const token = getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: () => {
    return isTokenValid();
  },

  /**
   * Cerrar sesión (logout)
   */
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

