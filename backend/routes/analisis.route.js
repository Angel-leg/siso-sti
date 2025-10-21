const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Estadísticas: incidentes por semana
router.get('/incidentes-por-semana', async (req, res) => {
  try {
    const query = `
      SELECT YEAR(fecha_incidente) AS anio,
             WEEK(fecha_incidente, 1) AS semana,
             COUNT(*) AS total_incidentes
      FROM incidentes
      GROUP BY anio, semana
      ORDER BY anio, semana
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

module.exports = router;
