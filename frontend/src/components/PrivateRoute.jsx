import React from "react";
import { Navigate } from "react-router-dom";
import { moduleAccess } from "../config/modulesConfig";
import normalizeRole from "../utils/normalizeRole";

const PrivateRoute = ({ children, moduleName }) => {
  const usuarioData = JSON.parse(localStorage.getItem("usuario"));
  const userRolRaw = usuarioData?.rol;
  const userRol = normalizeRole(userRolRaw);

  if (!userRol) {
    return <Navigate to="/" replace />;
  }

  const accessList = moduleAccess[userRol] || [];

  if (!accessList.includes(moduleName)) {
    console.warn(`Rol "${userRolRaw}" (${userRol}) no tiene acceso a "${moduleName}"`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
