// Función para normalizar roles se quitan tildes y mayúsculas
const normalizeRole = (role) => {
  return role
    .normalize("NFD") // descompone letras con tildes
    .replace(/[\u0300-\u036f]/g, "") // quita marcas diacríticas
    .toUpperCase(); // convierte a mayúsculas
};

export default normalizeRole;