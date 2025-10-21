const express = require("express");
const router = express.Router();
const db = require("../config/db");
const registrarBitacora = require("../utils/bitacoraLogger");
const authMiddleware = require("../middlewares/authMiddleware");

//GET se obtienen todos los incidentes
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.id_incidente,
        i.fecha_incidente,
        i.fecha_revision,
        i.descripcion,
        i.id_reporte,
        i.id_tipo_incidente,
        ti.tipo_incidente,
        i.id_gravedad,
        g.nivel AS gravedad,
        i.status,
        i.revisado_por
      FROM incidentes i
      JOIN tipo_incidente ti ON i.id_tipo_incidente = ti.id_tipo_incidente
      JOIN gravedad_incidente g ON i.id_gravedad = g.id_gravedad
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener incidentes" });
  }
});

//GET se obtienen tipos de incidente
router.get("/tipos", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tipo_incidente");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tipos de incidente" });
  }
});

//GET se obtienen gravedades
router.get("/gravedades", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM gravedad_incidente");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener gravedades" });
  }
});

//POST para crear un nuevo incidente
router.post("/", authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'clasificacion-reportes'), async (req, res) => {
  const {
    descripcion,
    id_reporte,
    id_tipo_incidente,
    id_gravedad,
    status,
    revisado_por,
  } = req.body;

  if (!descripcion || !id_reporte || !id_tipo_incidente || !id_gravedad || !status) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    //Obtener fecha del reporte original
    const [[reporte]] = await db.query(
      "SELECT fecha_reporte FROM reportes WHERE id_reporte = ?",
      [id_reporte]
    );

    if (!reporte) {
      return res.status(404).json({ error: "Reporte no encontrado" });
    }

    const fecha_incidente = reporte.fecha_reporte;

    const [result] = await db.query(
      `INSERT INTO incidentes 
        (fecha_incidente, descripcion, id_reporte, id_tipo_incidente, id_gravedad, status, revisado_por, fecha_revision) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        fecha_incidente,
        descripcion,
        id_reporte,
        id_tipo_incidente,
        id_gravedad,
        status,
        revisado_por,
      ]
    );
    if (req.user?.id_usuario) {
    await registrarBitacora(
      req.user.id_usuario,
      `Incidente revisado (ID: ${result.insertId})`
    );
  }
    //Devuelve el ID del incidente recién creado
    res.json({ 
      message: "Incidente registrado exitosamente",
      id_incidente: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar incidente" });
  }
});

//PUT, Para actualizar incidente
router.put("/:id", authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'clasificacion-reportes'), async (req, res) => {
  const { id } = req.params;
  const {
    descripcion,
    id_reporte,
    id_tipo_incidente,
    id_gravedad,
    status,
    revisado_por,
  } = req.body;

  try {
    // Obtener datos actuales del incidente
    const [actualRows] = await db.query(
      `SELECT * FROM incidentes WHERE id_incidente = ?`,
      [id]
    );

    if (actualRows.length === 0) {
      return res.status(404).json({ error: "Incidente no encontrado" });
    }

    const actual = actualRows[0];

    // Normalizar datos para comparar
    const normalize = (value) => {
      if (value === null || value === undefined) return "";
      return String(value).trim().toLowerCase();
    };

    const cambios = [];

    if (normalize(descripcion) !== normalize(actual.descripcion)) cambios.push("Descripción");
    if (Number(id_reporte) !== Number(actual.id_reporte)) cambios.push("ID del reporte");
    if (Number(id_tipo_incidente) !== Number(actual.id_tipo_incidente)) cambios.push("Tipo de incidente");
    if (Number(id_gravedad) !== Number(actual.id_gravedad)) cambios.push("Gravedad");
    if (normalize(status) !== normalize(actual.status)) cambios.push("Estado");
    if (normalize(revisado_por) !== normalize(actual.revisado_por)) cambios.push("Revisado por");

    // Si no hay cambios, no se hace nada
    if (cambios.length === 0) {
      return res.json({ message: "No se detectaron cambios" });
    }

    // Hacer el UPDATE
    await db.query(
      `UPDATE incidentes 
       SET descripcion = ?, id_reporte = ?, id_tipo_incidente = ?, id_gravedad = ?, status = ?, revisado_por = ?, fecha_revision = NOW()
       WHERE id_incidente = ?`,
      [
        descripcion,
        id_reporte,
        id_tipo_incidente,
        id_gravedad,
        status,
        revisado_por,
        id,
      ]
    );

    // Registrar en bitácora
    if (req.user?.id_usuario) {
      const mensaje = `Incidente editado (ID: ${id}) | ${cambios.join(", ")}`;
      await registrarBitacora(req.user.id_usuario, mensaje);
    }

    res.json({ message: "Incidente actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar incidente" });
  }
});

//DELETE, Eliminar incidente
router.delete("/:id", authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO'], 'clasificacion-reportes'), async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM incidentes WHERE id_incidente = ?", [id]);
    if (req.user?.id_usuario) {
    await registrarBitacora(
      req.user.id_usuario,
      `Incidente eliminado (ID: ${id})`
    );
  }
    res.json({ message: "Incidente eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar incidente" });
  }
});

//GET, Reportes con clasificación (vistas combinadas)
router.get("/reportes-con-clasificacion", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id_reporte AS ID,
        r.fecha_reporte AS fecha_reporte,
        r.descripcion AS descripcion,
        GROUP_CONCAT(DISTINCT CONCAT(t.nombres, ' ', t.apellidos) SEPARATOR ', ') AS involucrados,
        r.id_reporte AS reporte_id,
        ti.tipo_incidente AS tipo,
        g.nivel AS gravedad,
        IFNULL(i.status, 'Pendiente') AS status,
        IFNULL(i.revisado_por, '-') AS revisado_por,
        IFNULL(DATE_FORMAT(i.fecha_revision, '%Y-%m-%d'), '-') AS fecha_revision
      FROM reportes r
      LEFT JOIN incidentes i ON r.id_reporte = i.id_reporte
      LEFT JOIN tipo_incidente ti ON i.id_tipo_incidente = ti.id_tipo_incidente
      LEFT JOIN gravedad_incidente g ON i.id_gravedad = g.id_gravedad
      LEFT JOIN trabajador_incidente ti2 ON r.id_reporte = ti2.id_reporte
      LEFT JOIN trabajadores t ON ti2.id_trabajador = t.id_trabajador
      GROUP BY 
        r.id_reporte, 
        r.fecha_reporte, 
        r.descripcion, 
        ti.tipo_incidente, 
        g.nivel, 
        i.status, 
        i.revisado_por, 
        i.fecha_revision
      ORDER BY r.id_reporte
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reportes con clasificación" });
  }
});

module.exports = router;
