const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const registrarBitacora = require('../utils/bitacoraLogger');

// Obtener todos los mensajes
router.get('/', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO','TECNICO'], 'mensaje-dia'), async (req, res) => {
  try {
    await db.query(`
      UPDATE anuncios
      SET visible = 0
      WHERE fecha_expiracion IS NOT NULL
        AND fecha_expiracion < CURDATE()
        AND visible = 1
    `);

    const [rows] = await db.query(`
      SELECT a.*, u.nombres, u.apellidos
      FROM anuncios a
      JOIN usuarios u ON a.creado_por = u.id_usuario
      ORDER BY a.id_anuncio DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// Registrar un nuevo mensaje
router.post('/', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'mensaje-dia'), async (req, res) => {
  try {
    const { titulo, mensaje, fecha_publicacion, fecha_expiracion, visible } = req.body;
    const id_usuario_accion = req.user.id_usuario;

    if (!titulo || !mensaje) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: titulo o mensaje' });
    }

    const visibleVal = visible ? 1 : 0;

    await db.query(
      `INSERT INTO anuncios (titulo, mensaje, fecha_publicacion, fecha_expiracion, visible, creado_por)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        mensaje,
        fecha_publicacion || new Date().toISOString().split('T')[0],
        fecha_expiracion || null,
        visibleVal,
        id_usuario_accion
      ]
    );

    //Registrar en la bitácora
    await registrarBitacora(id_usuario_accion, `Mensaje creado: ${titulo}`);

    res.json({ message: 'Mensaje registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar mensaje:', error);
    res.status(500).json({ error: 'Error al registrar mensaje' });
  }
});

// Editar mensaje
router.put('/:id', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'mensaje-dia'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      mensaje,
      fecha_publicacion,
      fecha_expiracion,
      visible
    } = req.body;
    const id_usuario_accion = req.user.id_usuario;

    const [existente] = await db.query('SELECT * FROM anuncios WHERE id_anuncio = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    const actual = existente[0];

    // Función para normalizar fechas a 'YYYY-MM-DD'
  const obtenerFechaNormalizada = (fecha) => {
    if (!fecha) return null;

    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }

    const d = new Date(fecha);
    if (isNaN(d)) return null;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

    // Normalizar fechas
    const fechaPubNueva = obtenerFechaNormalizada(fecha_publicacion);
    const fechaPubActual = obtenerFechaNormalizada(actual.fecha_publicacion);
    const fechaExpNueva = obtenerFechaNormalizada(fecha_expiracion);
    const fechaExpActual = obtenerFechaNormalizada(actual.fecha_expiracion);

    // Campos editados
    const camposEditados = [];

    if (titulo !== undefined && titulo !== actual.titulo) camposEditados.push('título');
    if (mensaje !== undefined && mensaje !== actual.mensaje) camposEditados.push('mensaje');
    if (fecha_publicacion !== undefined && fechaPubNueva !== fechaPubActual) camposEditados.push('fecha_publicación');
    if (fecha_expiracion !== undefined && fechaExpNueva !== fechaExpActual) camposEditados.push('fecha_expiración');
    if (visible !== undefined && (visible ? 1 : 0) !== actual.visible) camposEditados.push('visible');

    if (camposEditados.length === 0) {
      return res.status(400).json({ error: 'No hay cambios para actualizar' });
    }

    // Construcción dinámica de la query
    const updates = [];
    const params = [];

    if (titulo !== undefined) {
      updates.push('titulo = ?');
      params.push(titulo);
    }

    if (mensaje !== undefined) {
      updates.push('mensaje = ?');
      params.push(mensaje);
    }

    if (fecha_publicacion !== undefined) {
      updates.push('fecha_publicacion = ?');
      params.push(fechaPubNueva);
    }

    if (fecha_expiracion !== undefined) {
      updates.push('fecha_expiracion = ?');
      params.push(fechaExpNueva || null);
    }

    if (visible !== undefined) {
      updates.push('visible = ?');
      params.push(visible ? 1 : 0);
    }

    const query = `UPDATE anuncios SET ${updates.join(', ')} WHERE id_anuncio = ?`;
    params.push(id);

    await db.query(query, params);

    // Bitácora
    const mensajeBitacora = `Mensaje actualizado (ID: ${id}): Se modificó ${camposEditados.join(', ')}`;
    await registrarBitacora(id_usuario_accion, mensajeBitacora);

    res.json({ message: 'Mensaje actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar mensaje:', error);
    res.status(500).json({ error: 'Error al actualizar mensaje' });
  }
});

// Eliminar mensaje
router.delete('/:id', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'mensaje-dia'), async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario_accion = req.user.id_usuario;

    const [existente] = await db.query('SELECT * FROM anuncios WHERE id_anuncio = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    await db.query('DELETE FROM anuncios WHERE id_anuncio=?', [id]);

    //Registrar en la bitácora
    await registrarBitacora(id_usuario_accion, `Mensaje eliminado (ID: ${id}): ${existente[0].titulo}`);

    res.json({ message: 'Mensaje eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(500).json({ error: 'Error al eliminar mensaje' });
  }
});

module.exports = router;
