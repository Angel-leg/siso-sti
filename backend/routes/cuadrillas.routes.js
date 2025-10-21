const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const registrarBitacora = require('../utils/bitacoraLogger');

// Obtener todas las cuadrillas
router.get('/', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'cuadrillas'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cuadrillas');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener cuadrillas:', error);
    res.status(500).json({ error: 'Error al obtener cuadrillas' });
  }
});

// Registrar nueva cuadrilla
router.post('/', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'cuadrillas'), async (req, res) => {
  const { no_unidad, nombre_cuadrilla, zona_de_trabajo } = req.body;
  const id_usuario_accion = req.user.id_usuario;

  if (!no_unidad || !nombre_cuadrilla || !zona_de_trabajo) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM cuadrillas WHERE no_unidad = ?', [no_unidad]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El número de unidad ya existe' });
    }

    await db.query(
      'INSERT INTO cuadrillas (no_unidad, nombre_cuadrilla, zona_de_trabajo) VALUES (?, ?, ?)',
      [no_unidad, nombre_cuadrilla, zona_de_trabajo]
    );

    if (id_usuario_accion) {
      await registrarBitacora(
        id_usuario_accion,
        `Cuadrilla creada: ${nombre_cuadrilla}`
      );
    }

    res.json({ message: 'Cuadrilla registrada exitosamente' });
  } catch (error) {
    console.error('Error al registrar cuadrilla:', error);
    res.status(500).json({ error: 'Error al registrar cuadrilla' });
  }
});

// Editar cuadrilla
router.put('/:id', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'cuadrillas'), async (req, res) => {
  const { id } = req.params;
  const { no_unidad, nombre_cuadrilla, zona_de_trabajo } = req.body;
  const id_usuario_accion = req.user.id_usuario;

  try {
    const [cuadrillasExistentes] = await db.query('SELECT * FROM cuadrillas WHERE id_cuadrilla = ?', [id]);
    if (cuadrillasExistentes.length === 0) {
      return res.status(404).json({ error: 'Cuadrilla no encontrada' });
    }

    const actual = cuadrillasExistentes[0];
    const camposEditados = [];

    if (no_unidad && no_unidad !== actual.no_unidad) camposEditados.push('no_unidad');
    if (nombre_cuadrilla && nombre_cuadrilla !== actual.nombre_cuadrilla) camposEditados.push('nombre_cuadrilla');
    if (zona_de_trabajo && zona_de_trabajo !== actual.zona_de_trabajo) camposEditados.push('zona_de_trabajo');

    await db.query(
      'UPDATE cuadrillas SET no_unidad = ?, nombre_cuadrilla = ?, zona_de_trabajo = ? WHERE id_cuadrilla = ?',
      [no_unidad, nombre_cuadrilla, zona_de_trabajo, id]
    );

    if (camposEditados.length > 0) {
      const camposLegibles = {
        no_unidad: "no unidad",
        nombre_cuadrilla: "nombre de cuadrilla",
        zona_de_trabajo: "zona de trabajo"
      };

      const formatearCampo = (campo) => camposLegibles[campo] || campo.replace(/_/g, ' ');

      const camposFormateados = camposEditados.map(formatearCampo);
      const mensaje = `Cuadrilla actualizada (ID: ${id}): Se modificó ${camposFormateados.join(', ')}`;
      
      await registrarBitacora(id_usuario_accion, mensaje);
    }

    res.json({ message: 'Cuadrilla actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cuadrilla:', error);
    res.status(500).json({ error: 'Error al actualizar cuadrilla' });
  }
});

// Eliminar cuadrilla
router.delete('/:id', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'cuadrillas'), async (req, res) => {
  const { id } = req.params;
  const id_usuario_accion = req.user.id_usuario;

  try {
    const [cuadrillas] = await db.query('SELECT * FROM cuadrillas WHERE id_cuadrilla = ?', [id]);
    if (cuadrillas.length === 0) {
      return res.status(404).json({ error: 'Cuadrilla no encontrada' });
    }

    const cuadrilla = cuadrillas[0];

    await db.query('DELETE FROM cuadrillas WHERE id_cuadrilla = ?', [id]);

    if (id_usuario_accion) {
      await registrarBitacora(
        id_usuario_accion,
        `Cuadrilla eliminada: ${cuadrilla.nombre_cuadrilla} (ID: ${id})`
      );
    }

    res.json({ message: 'Cuadrilla eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cuadrilla:', error);
    res.status(500).json({ error: 'Error al eliminar cuadrilla' });
  }
});

module.exports = router;
