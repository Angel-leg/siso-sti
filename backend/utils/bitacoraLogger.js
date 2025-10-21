const db = require('../config/db');

async function registrarBitacora(id_usuario, accion) {
  try {
    await db.query(
      'INSERT INTO bitacora (id_usuario, accion, fecha_hora) VALUES (?, ?, NOW())',
      [id_usuario, accion]
    );
  } catch (error) {
    console.error('Error al registrar en la bitácora:', error);
  }
}

module.exports = registrarBitacora;
