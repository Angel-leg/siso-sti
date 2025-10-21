const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const connection = await db.getConnection();

    //Consulta que une las tablas usuarios con roles
    const [rows] = await connection.query(`
      SELECT u.*, r.nombre_rol 
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.usuario = ?
    `, [usuario]);

    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }

    const user = rows[0];

    //Validar estado del usuario
    if (parseInt(user.estado) !== 1) {
      return res.status(403).json({ message: 'Usuario inactivo. Contacte al administrador.' });
    }

    //Validar contraseña de usuario
    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }

    //Generar token
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        usuario: user.usuario,
        id_rol: user.id_rol,
        rol: user.nombre_rol.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      id_rol: user.id_rol,
      rol: user.nombre_rol.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(),
      usuario: user.usuario,
      nombres: user.nombres,
      apellidos: user.apellidos,
      estado: user.estado,
      id_usuario: user.id_usuario,
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
