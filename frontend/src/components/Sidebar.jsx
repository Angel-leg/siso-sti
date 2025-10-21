import React from "react";
import { FaUsers, FaUserTie, FaHardHat, FaClipboardList, FaChartBar, FaClock, FaBell, FaBook, FaCalendarAlt, FaCommentDots, FaPlayCircle } from "react-icons/fa";
import { moduleAccess } from "../config/modulesConfig";
import normalizeRole from "../utils/normalizeRole";
import "../assets/styles/Sidebar.css";

const Sidebar = ({ colapsado = false }) => {
  const usuarioData = JSON.parse(localStorage.getItem("usuario")) || {};
  const userRol = normalizeRole(usuarioData.rol || "");

  const modules = [
    { key: "usuarios", name: "Gestión de usuarios", path: "/usuarios", icon: <FaUsers /> },
    { key: "cuadrillas", name: "Gestión de cuadrillas", path: "/cuadrillas", icon: <FaHardHat /> },
    { key: "trabajadores", name: "Gestión de trabajadores", path: "/trabajadores", icon: <FaUserTie /> },
    { key: "registro-incidentes", name: "Registro de incidentes", path: "/registro-incidentes", icon: <FaClipboardList /> },
    { key: "clasificacion-reportes", name: "Clasificación de incidentes", path: "/clasificacion-reportes", icon: <FaCalendarAlt /> },
    { key: "reportes", name: "Análisis de reportes", path: "/reportes", icon: <FaChartBar /> },
    { key: "contador-dias", name: "Contador de días sin accidentes", path: "/contador", icon: <FaClock /> },
    { key: "alertas", name: "Alertas", path: "/alertas", icon: <FaBell /> },
    { key: "bitacora", name: "Bítacora", path: "/bitacora", icon: <FaBook /> },
    { key: "mensaje-dia", name: "Mensaje del día", path: "/mensaje", icon: <FaCommentDots /> },
    { key: "inicio-contador", name: "Inicio de contador", path: "/inicio-contador", icon: <FaPlayCircle /> },
  ];

  const allowedModules = moduleAccess[userRol] || [];
  const visibleModules = modules.filter(mod => allowedModules.includes(mod.key));

  return (
    <aside className={`sidebar ${colapsado ? "collapsed" : ""}`}>
      <ul className="nav flex-column">
        {visibleModules.map((modulo, index) => (
          <li key={index} className="nav-item">
            <a href={modulo.path} className="nav-link">
              {modulo.icon}
              <span className="nav-label">{modulo.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
