import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const login = async (correo, contrasena) => {
  try {
    const res = await axios.post(`${API_URL}/login`, {
      correo,
      contrasena,
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
  }
};

export default {
  login,
};
