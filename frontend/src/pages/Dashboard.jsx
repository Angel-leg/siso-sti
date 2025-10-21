import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import { FaSignOutAlt } from "react-icons/fa";
import "../assets/styles/0globalbotones.css"

const Dashboard = () => {
  const usuarioData = JSON.parse(localStorage.getItem("usuario")) || {};
  const username = usuarioData.nombres || "usuario";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-layout">
      <Sidebar colapsado={false} />
      <main className="main-content">
        <div className="dashboard-header">
          <button className="btn btn-danger" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Cerrar sesión
          </button>
        </div>  

        <div className="welcome-panel">
          <h2 className="mb-3 titulo-bienvenida">¡Bienvenido al sistema, {username}!</h2>
          <p className="mb-4">
            Este es tu panel principal. Desde aquí puedes acceder a los módulos.
          </p>
          <ul className="list-unstyled">
            <li>- Accede fácilmente a los módulos desde el menú lateral.</li>
            <li>- Revisa tus reportes e incidentes.</li>
            <li>- Mantente al tanto de los días sin accidentes.</li>
            <li>- Tu participación mantiene la seguridad del equipo.</li>
          </ul>
          <hr className="my-4" />
          <p className="fst-italic text-muted">"La seguridad comienza contigo. Usa siempre tu equipo de protección."</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
