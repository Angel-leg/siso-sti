import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/styles/1login.css";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/auth/login", {
        usuario,
        contrasena,
      });

      const { token, rol, estado, id_usuario, usuario: nombreUsuario, nombres, apellidos } = res.data;

      //Se verifica que todos los valores existan antes de guardar
      if (!token || !rol || !estado || !id_usuario) {
        alert("Faltan datos en la respuesta del servidor.");
        return;
      }

      // Guarda datos individuales en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("estado", estado);
      localStorage.setItem("id_usuario", id_usuario);

      // Guarda objeto completo con id_usuario
      localStorage.setItem(
        "usuario",
        JSON.stringify({
          id_usuario,
          usuario: nombreUsuario,
          rol,
          nombres,
          apellidos
        })
      );

      // Si el usuario está activo se redirige al dashboard
      if (parseInt(estado) === 1) {
        navigate("/dashboard");
      } else {
        alert("Usuario inactivo. Contacte al administrador.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      const mensaje = error.response?.data?.message;

      if (mensaje) {
        alert(mensaje);
      } else {
        alert("Error desconocido al iniciar sesión.");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          <button type="submit">Iniciar sesión</button>
          <p className="forgot-password">¿Olvidaste tu contraseña?</p>
        </form>
      </div>
    </div>
  );
};

export default Login;
