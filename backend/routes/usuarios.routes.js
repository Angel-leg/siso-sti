const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middlewares/authMiddleware');
const registrarBitacora = require('../utils/bitacoraLogger');

//Protección de rutas desde el backend
router.get('/', authMiddleware(['MASTER', 'ADMINISTRADOR'], 'usuarios'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombres, u.apellidos, u.correo, u.usuario, u.id_rol, r.nombre_rol, u.estado
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id_rol`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

//Se obtienen los roles desde la ruta /api/usuarios/roles
router.get('/roles', authMiddleware(['MASTER', 'ADMINISTRADOR'], 'usuarios'), async (req, res) => {
  try {
    const [roles] = await db.query('SELECT id_rol, nombre_rol FROM roles');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});

// Registrar nuevo usuario en la base de datos
router.post('/', authMiddleware(['MASTER', 'ADMINISTRADOR'], 'usuarios'), async (req, res) => {
  const { nombres, apellidos, correo, usuario, contrasena, id_rol, estado } = req.body;

  const id_usuario_accion = req.user.id_usuario;

  if (
    !nombres ||
    !apellidos ||
    !correo ||
    !usuario ||
    !contrasena ||
    !id_rol ||
    (estado !== "0" && !estado)
  ) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const estadoVal = estado === "0" ? 0 : 1;

    await db.query(
      'INSERT INTO usuarios (nombres, apellidos, correo, usuario, contrasena, id_rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombres, apellidos, correo, usuario, hashedPassword, id_rol, estadoVal]
    );

    if (id_usuario_accion) {
      await registrarBitacora(
        id_usuario_accion,
        `Usuario creado: ${usuario}`
      );
    }

    res.json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Editar usuario
router.put('/:id', authMiddleware(['MASTER', 'ADMINISTRADOR'], 'usuarios'), async (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, correo, usuario, contrasena, id_rol, estado } = req.body;

  const id_usuario_accion = req.user.id_usuario;

  try {
    //Obtener datos actuales del usuario
    const [usuariosExistentes] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id]);
    if (usuariosExistentes.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuarioActual = usuariosExistentes[0];
    const camposEditados = [];

    //Comparar campo por campo para saber que dato fue actualizado
    if (nombres && nombres !== usuarioActual.nombres) camposEditados.push('nombres');
    if (apellidos && apellidos !== usuarioActual.apellidos) camposEditados.push('apellidos');
    if (correo && correo !== usuarioActual.correo) camposEditados.push('correo');
    if (usuario && usuario !== usuarioActual.usuario) camposEditados.push('usuario');
    if (parseInt(id_rol) !== usuarioActual.id_rol) camposEditados.push('rol');
    if ((estado === "0" ? 0 : 1) !== usuarioActual.estado) camposEditados.push('estado');
    if (contrasena && contrasena.trim() !== '') camposEditados.push('contraseña');

    //Armar SQL para actualización
    const fields = [
      'nombres = ?',
      'apellidos = ?',
      'correo = ?',
      'usuario = ?',
      'id_rol = ?',
      'estado = ?'
    ];

    const values = [
      nombres,
      apellidos,
      correo,
      usuario,
      id_rol,
      estado === "0" ? 0 : 1
    ];

    if (contrasena && contrasena.trim() !== '') {
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      fields.splice(4, 0, 'contrasena = ?');
      values.splice(4, 0, hashedPassword);
    }

    const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`;
    values.push(id);

    await db.query(sql, values);

    //Registrar en bitácora solo si se realizaron cambios
    if (camposEditados.length > 0) {
      const mensajeAccion = `Usuario editado (${usuario}): Se modificó ${camposEditados.join(', ')}`;
      await registrarBitacora(id_usuario_accion, mensajeAccion);
    }

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', authMiddleware(['MASTER', 'ADMINISTRADOR'], 'usuarios'), async (req, res) => {
  const { id } = req.params;
  const id_usuario_accion = req.user.id_usuario;

  try {
    const [usuarios] = await db.query('SELECT usuario FROM usuarios WHERE id_usuario = ?', [id]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const usuarioEliminar = usuarios[0].usuario;

    await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);

    if (id_usuario_accion) {
      await registrarBitacora(
        id_usuario_accion,
        `Usuario eliminado: ${usuarioEliminar} (ID: ${id})`
      );
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
