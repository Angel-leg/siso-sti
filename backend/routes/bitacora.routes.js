const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

//Obtener bitácora
router.get('/', authMiddleware(['MASTER', 'ADMINISTRADOR']), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id_bitacora,
        CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo,
        b.accion,
        b.fecha_hora
      FROM bitacora b
      LEFT JOIN usuarios u ON b.id_usuario = u.id_usuario
      ORDER BY b.fecha_hora DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener bitácora:', error);
    res.status(500).json({ error: 'Error al obtener bitácora' });
  }
});

module.exports = router;
