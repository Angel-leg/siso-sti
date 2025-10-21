const jwt = require('jsonwebtoken');

const moduleAccess = {
  MASTER: [
    "dashboard",
    "usuarios",
    "trabajadores",
    "cuadrillas",
    "registro-incidentes",
    "reportes",
    "contador-dias",
    "alertas",
    "bitacora",
    "clasificacion-reportes",
    "mensaje-dia",
    "inicio-contador"
  ],
  ADMINISTRADOR: [
    "dashboard",
    "usuarios",
    "trabajadores",
    "cuadrillas",
    "registro-incidentes",
    "reportes",
    "contador-dias",
    "alertas",
    "bitacora",
    "clasificacion-reportes",
    "mensaje-dia",
    "inicio-contador"
  ],
  SISO: [
    "dashboard",
    "trabajadores",
    "cuadrillas",
    "registro-incidentes",
    "reportes",
    "contador-dias",
    "alertas",
    "mensaje-dia",
    "clasificacion-reportes"
  ],
  TECNICO: [
    "dashboard",
    "registro-incidentes",
    "reportes",
    "contador-dias"
  ]
};

const authMiddleware = (rolesPermitidos = [], modulo = null) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ mensaje: 'No token proporcionado' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ mensaje: 'Token mal formado' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ mensaje: 'Token inválido' });

      const userRol = decoded.rol.toUpperCase();

      //Validar si el rol del usuario está en la lista de roles permitidos
      if (rolesPermitidos.length && !rolesPermitidos.includes(userRol)) {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
      }

      // Validar acceso a módulo si se especificó
      if (modulo) {
        const accesos = moduleAccess[userRol] || [];
        if (!accesos.includes(modulo)) {
          return res.status(403).json({ mensaje: 'Acceso al módulo denegado' });
        }
      }

      req.user = decoded;
      next();
    });
  };
};

module.exports = authMiddleware;
