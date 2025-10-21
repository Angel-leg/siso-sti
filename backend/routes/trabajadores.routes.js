const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const registrarBitacora = require('../utils/bitacoraLogger');

//Obtener todos los trabajadores
router.get('/', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'trabajadores'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id_trabajador, t.codigo_trabajador, t.nombres, t.apellidos, t.puesto,
       t.id_cuadrilla, c.nombre_cuadrilla AS nombre_cuadrilla
      FROM trabajadores t
      JOIN cuadrillas c ON t.id_cuadrilla = c.id_cuadrilla`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener trabajadores' });
  }
});

// Obtener todas las cuadrillas
router.get('/cuadrillas', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cuadrillas');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener cuadrillas', error);
    res.status(500).json({ error: 'Error al obtener cuadrillas' });
  }
});

//Registrar nuevo trabajador
router.post('/', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'trabajadores'), async (req, res) => {
  const { codigo_trabajador, nombres, apellidos, puesto, id_cuadrilla } = req.body;
  const id_usuario_accion = req.user.id_usuario;

  if (!codigo_trabajador || !nombres || !apellidos || !puesto || !id_cuadrilla) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM trabajadores WHERE codigo_trabajador = ?', [codigo_trabajador]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El código de trabajador ya existe' });
    }

    await db.query(
      'INSERT INTO trabajadores (codigo_trabajador, nombres, apellidos, puesto, id_cuadrilla) VALUES (?, ?, ?, ?, ?)',
      [codigo_trabajador, nombres, apellidos, puesto, id_cuadrilla]
    );

    if (id_usuario_accion) {
      await registrarBitacora(
        id_usuario_accion,
        `Trabajador creado: ${nombres} ${apellidos}`
      );
    }

    res.json({ message: 'Trabajador registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar trabajador' });
  }
});

//Editar trabajador
router.put('/:id', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'trabajadores'), async (req, res) => {
  const { id } = req.params;
  const { codigo_trabajador, nombres, apellidos, puesto, id_cuadrilla } = req.body;
  const id_usuario_accion = req.user.id_usuario;

  try {
    const [existente] = await db.query('SELECT * FROM trabajadores WHERE id_trabajador = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    const actual = existente[0];
    const camposEditados = [];

    if (codigo_trabajador && codigo_trabajador !== actual.codigo_trabajador) camposEditados.push('código');
    if (nombres && nombres !== actual.nombres) camposEditados.push('nombres');
    if (apellidos && apellidos !== actual.apellidos) camposEditados.push('apellidos');
    if (puesto && puesto !== actual.puesto) camposEditados.push('puesto');
    if (id_cuadrilla && id_cuadrilla.toString() !== actual.id_cuadrilla.toString()) camposEditados.push('cuadrilla');

    await db.query(
      `UPDATE trabajadores SET 
        codigo_trabajador = ?, 
        nombres = ?, 
        apellidos = ?, 
        puesto = ?, 
        id_cuadrilla = ?
      WHERE id_trabajador = ?`,
      [codigo_trabajador, nombres, apellidos, puesto, id_cuadrilla, id]
    );

    if (camposEditados.length > 0 && id_usuario_accion) {
      const mensaje = `Trabajador actualizado (ID: ${id}): Se modificó ${camposEditados.join(', ')}`;
      await registrarBitacora(id_usuario_accion, mensaje);
    }

    res.json({ message: 'Trabajador actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar trabajador' });
  }
});

//Eliminar trabajador
router.delete('/:id', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'trabajadores'), async (req, res) => {
  const { id } = req.params;
  const id_usuario_accion = req.user.id_usuario;

  try {
    const [result] = await db.query('SELECT * FROM trabajadores WHERE id_trabajador = ?', [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    const trabajador = result[0];

    await db.query('DELETE FROM trabajadores WHERE id_trabajador = ?', [id]);

    if (id_usuario_accion) {
      await registrarBitacora(
        id_usuario_accion,
        `Trabajador eliminado: ${trabajador.nombres} ${trabajador.apellidos} (ID: ${id})`
      );
    }

    res.json({ message: 'Trabajador eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar trabajador' });
  }
});

module.exports = router;
