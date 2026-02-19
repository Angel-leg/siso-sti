const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const registrarBitacora = require('../utils/bitacoraLogger');

// Iniciar el contador
router.post('/iniciar', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'inicio-contador'), async (req, res) => {
  const { fecha_de_inicio } = req.body;
  const id_usuario = req.user.id_usuario;

  try {
    const [existe] = await db.query(
      'SELECT * FROM dias_sin_accidentes WHERE fecha_fin IS NULL LIMIT 1'
    );

    if (existe.length > 0) {
      return res.status(400).json({ message: 'Ya hay un contador activo.' });
    }

    await db.query(
      'INSERT INTO dias_sin_accidentes (fecha_de_inicio, id_usuario) VALUES (?, ?)',
      [fecha_de_inicio, id_usuario]
    );

    await registrarBitacora(id_usuario, `Se inició el contador de días sin accidentes en ${fecha_de_inicio}`);

    res.status(200).json({ message: 'Contador iniciado correctamente.' });
  } catch (error) {
    console.error('Error al iniciar contador:', error);
    res.status(500).json({ message: 'Error al iniciar contador' });
  }
});

// Reiniciar el contador
router.post('/reiniciar', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'inicio-contador'), async (req, res) => {
  const { fecha_incidente, id_incidente } = req.body;
  const id_usuario = req.user.id_usuario;

  try {
    const [contadorActivo] = await db.query(
      'SELECT * FROM dias_sin_accidentes WHERE fecha_fin IS NULL LIMIT 1'
    );

    if (contadorActivo.length === 0) {
      return res.status(400).json({ message: 'No hay contador activo para reiniciar.' });
    }

    const contador = contadorActivo[0];

    const fechaInicio = new Date(contador.fecha_de_inicio);
    const fechaFin = new Date(fecha_incidente);

    if (fechaFin < fechaInicio) {
      return res.status(400).json({ message: 'La fecha del incidente no puede ser anterior a la fecha de inicio del contador.' });
    }

    const diasTotales = Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

    await db.query(
      `UPDATE dias_sin_accidentes
       SET fecha_fin = ?, dias_totales = ?, id_incidente = ?
       WHERE id_contador = ?`,
      [fecha_incidente, diasTotales, id_incidente, contador.id_contador]
    );

    await db.query(
      `INSERT INTO dias_sin_accidentes (fecha_de_inicio, id_usuario)
       VALUES (?, ?)`,
      [fecha_incidente, id_usuario]
    );

    await registrarBitacora(id_usuario, `Contador reiniciado por incidente (ID incidente: ${id_incidente}) el ${fecha_incidente}. Total días sin accidentes: ${diasTotales}.`);

    res.status(200).json({ message: 'Contador reiniciado exitosamente.' });
  } catch (error) {
    console.error('Error al reiniciar contador:', error);
    res.status(500).json({ message: 'Error al reiniciar contador.' });
  }
});

// Reinicio forzoso
// Reinicio forzoso
router.post('/reiniciar-forzoso', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'inicio-contador'), async (req, res) => {
  const id_usuario = req.user.id_usuario;
  const hoy = new Date().toISOString().slice(0, 10);

  // Función para normalizar fecha a inicio del día UTC
  const normalizarFecha = (fecha) => {
    return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  };

  try {
    const [activo] = await db.query(
      'SELECT * FROM dias_sin_accidentes WHERE fecha_fin IS NULL LIMIT 1'
    );

    if (activo.length > 0) {
      const contador = activo[0];
      const fechaInicio = normalizarFecha(new Date(contador.fecha_de_inicio));
      const fechaFin = normalizarFecha(new Date(hoy));

      const diferenciaMs = fechaFin - fechaInicio;
      const diasTotales = Math.max(0, Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)));

      await db.query(
        `UPDATE dias_sin_accidentes
         SET fecha_fin = ?, dias_totales = ?, id_incidente = NULL
         WHERE id_contador = ?`,
        [hoy, diasTotales, contador.id_contador]
      );

      await registrarBitacora(id_usuario, `Reinicio forzoso del contador. Se cerró con ${diasTotales} días sin accidentes`);
    } else {
      await registrarBitacora(id_usuario, `Inicio de contador forzoso sin necesidad de cierre anterior`);
    }

    await db.query(
      `INSERT INTO dias_sin_accidentes (fecha_de_inicio, id_usuario)
       VALUES (?, ?)`,
      [hoy, id_usuario]
    );

    res.status(200).json({ message: 'Contador reiniciado forzosamente' });
  } catch (error) {
    console.error('Error en reinicio forzoso:', error);
    res.status(500).json({ message: 'Error al reiniciar forzosamente el contador' });
  }
});

// Reinicio automático por incidente
router.post('/reiniciar-por-incidente', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'inicio-contador'), async (req, res) => {
  const { id_incidente, fecha_incidente } = req.body;
  const id_usuario = req.user.id_usuario;

  try {
    const [activo] = await db.query(
      'SELECT * FROM dias_sin_accidentes WHERE fecha_fin IS NULL LIMIT 1'
    );

    if (activo.length === 0) {
      return res.status(400).json({ message: 'No hay contador activo para reiniciar.' });
    }

    const contador = activo[0];
    const fechaInicio = new Date(contador.fecha_de_inicio);
    const fechaFin = new Date(fecha_incidente);

    if (fechaFin < fechaInicio) {
      return res.status(400).json({
        message: 'La fecha del incidente no puede ser anterior a la fecha de inicio del contador.'
      });
    }

    const diasTotales = Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

    await db.query(
      `UPDATE dias_sin_accidentes
       SET fecha_fin = ?, dias_totales = ?, id_incidente = ?
       WHERE id_contador = ?`,
      [fecha_incidente, diasTotales, id_incidente, contador.id_contador]
    );

    await db.query(
      `INSERT INTO dias_sin_accidentes (fecha_de_inicio, id_usuario)
       VALUES (?, ?)`,
      [fecha_incidente, id_usuario]
    );

    await registrarBitacora(id_usuario, `Contador reiniciado automáticamente por incidente (ID incidente: ${id_incidente}). Días sin accidentes: ${diasTotales}`);

    res.status(200).json({ message: 'Contador reiniciado automáticamente por clasificación de incidente.' });
  } catch (error) {
    console.error('Error al reiniciar por incidente:', error);
    res.status(500).json({ message: 'Error al reiniciar por clasificación de incidente.' });
  }
});

// Obtener el estado actual
router.get('/actual', authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO', 'TECNICO'], 'inicio-contador'), async (req, res) => {
  try {
    const [resultado] = await db.query(
      'SELECT * FROM dias_sin_accidentes ORDER BY id_contador DESC LIMIT 1'
    );

    res.status(200).json(resultado[0] || {});
  } catch (error) {
    console.error('Error al obtener estado actual del contador:', error);
    res.status(500).json({ message: 'Error al obtener estado actual del contador.' });
  }
});

module.exports = router;
