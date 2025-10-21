import { useState } from 'react';

const LoginForm = ({ onLoginSuccess }) => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesión');
        return;
      }

      //Guardar token y usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label>Correo:</label>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
      </div>

      <div>
        <label>Contraseña:</label>
        <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
      </div>

      <button type="submit">Entrar</button>
    </form>
  );
};

export default LoginForm;
