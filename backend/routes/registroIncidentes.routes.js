const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middlewares/authMiddleware");
const registrarBitacora = require("../utils/bitacoraLogger");
const fs = require('fs');

//Configuración de Multer para manejar archivos adjuntos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//Obtener reportes con datos relacionados (modificado)
router.get("/", async (req, res) => {
  const id_usuario = req.query.usuario;

  try {
    let query = `
      SELECT 
        r.*,
        t.tipo_trabajo,
        tt.rango_tension,
        CONCAT(u.nombres, ' ', u.apellidos) AS nombre_usuario,
        c.nombre_cuadrilla,
        COALESCE(i.status, 'Pendiente') AS status,
        COALESCE(i.revisado_por, '-') AS nombre_revisor,
        COALESCE(DATE_FORMAT(i.fecha_revision, '%Y-%m-%d'), '-') AS fecha_revision
      FROM reportes r
      JOIN tipo_trabajo t ON r.id_tipo_trabajo = t.id_tipo_trabajo
      JOIN trabajo_tension tt ON r.id_tension = tt.id_tension
      JOIN usuarios u ON r.id_usuario = u.id_usuario
      JOIN cuadrillas c ON r.id_cuadrilla = c.id_cuadrilla
      LEFT JOIN incidentes i ON r.id_reporte = i.id_reporte
    `;

    const params = [];

    if (id_usuario) {
      query += ` WHERE r.id_usuario = ?`;
      params.push(id_usuario);
    }

    query += ` ORDER BY r.id_reporte`;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reportes" });
  }
});

//Obtener listas para selects
router.get("/listas", async (req, res) => {
  try {
    const [tiposTrabajo] = await db.query("SELECT * FROM tipo_trabajo");
    const [tensiones] = await db.query("SELECT * FROM trabajo_tension");
    const [usuarios] = await db.query("SELECT id_usuario, nombres, apellidos FROM usuarios");
    const [cuadrillas] = await db.query("SELECT id_cuadrilla, nombre_cuadrilla FROM cuadrillas");

    res.json({ tiposTrabajo, tensiones, usuarios, cuadrillas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener listas" });
  }
});

//Obtener trabajadores por cuadrilla
router.get("/trabajadores/:id_cuadrilla", async (req, res) => {
  const { id_cuadrilla } = req.params;
  try {
    const [trabajadores] = await db.query(
      `SELECT t.id_trabajador, t.nombres, t.apellidos 
       FROM trabajadores t
       WHERE t.id_cuadrilla = ?`,
      [id_cuadrilla]
    );
    res.json(trabajadores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener trabajadores" });
  }
});

function borrarArchivo(nombreArchivo) {
  if (!nombreArchivo) return;
  const rutaArchivo = path.join(__dirname, '..', 'uploads', nombreArchivo);
  fs.unlink(rutaArchivo, (err) => {
    if (err) {
      console.error(`Error al borrar archivo: ${rutaArchivo}`, err);
    }
  });
}

//Registrar nuevo reporte e incidente
router.post("/", authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO', 'TECNICO'], 'reportes'), upload.single("archivo_adjunto"), async (req, res) => {
  const {
    fecha_reporte,
    ubicacion,
    id_tipo_trabajo,
    id_tension,
    id_usuario,
    id_cuadrilla,
    descripcion,
    status_reporte,
    revisado_por,
    fecha_revision,
    trabajadores_incidente,
    fecha_incidente,
    id_tipo_incidente,
    id_gravedad
  } = req.body;

  const archivo_adjunto = req.file ? req.file.filename : null;

  if (!fecha_reporte || !ubicacion || !id_tipo_trabajo || !id_tension || !id_usuario || !id_cuadrilla) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  let trabajadoresArray = [];
  try {
    if (trabajadores_incidente) {
      trabajadoresArray = JSON.parse(trabajadores_incidente);
    }
  } catch (error) {
    return res.status(400).json({ error: "Formato inválido en trabajadores_incidente" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    //Insertar reporte sin columnas que no existen
    const [result] = await conn.query(
      `INSERT INTO reportes 
       (fecha_reporte, ubicacion, id_tipo_trabajo, id_tension, id_usuario, id_cuadrilla, descripcion, archivo_adjunto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fecha_reporte,
        ubicacion,
        id_tipo_trabajo,
        id_tension,
        id_usuario,
        id_cuadrilla,
        descripcion,
        archivo_adjunto
      ]
    );

    const id_reporte = result.insertId;

    //Insertar incidente relacionado
    if (status_reporte || revisado_por || fecha_revision || fecha_incidente || id_tipo_incidente || id_gravedad) {
      await conn.query(
        `INSERT INTO incidentes
        (fecha_incidente, fecha_revision, descripcion, id_reporte, id_tipo_incidente, id_gravedad, status, revisado_por)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fecha_incidente || fecha_reporte,
          fecha_revision || null,
          descripcion,
          id_reporte,
          id_tipo_incidente || 1,
          id_gravedad || 1,
          status_reporte || "Pendiente",
          revisado_por || null
        ]
      );
    }

    //Insertar trabajadores involucrados en incidente
    if (trabajadoresArray.length > 0) {
      const insertTrabajadores = trabajadoresArray.map(({ id_trabajador, rol_en_incidente, observaciones }) => [
        id_trabajador,
        id_reporte,
        rol_en_incidente || "Involucrado",
        observaciones || ""
      ]);
      await conn.query(
        `INSERT INTO trabajador_incidente (id_trabajador, id_reporte, rol_en_incidente, observaciones) VALUES ?`,
        [insertTrabajadores]
      );
    }

    await conn.commit();

    if (req.user?.id_usuario) {
      const nombreUsuarioAccion = req.user.nombres && req.user.apellidos
        ? `${req.user.nombres} ${req.user.apellidos}`
        : "Usuario desconocido";

      await registrarBitacora(
        req.user.id_usuario,
        `Reporte creado (ID: ${id_reporte})`
      );
    }

    res.json({ message: "Reporte e incidente registrados exitosamente" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Error al registrar reporte e incidente" });
  } finally {
    conn.release();
  }
});

//Editar reporte e incidente existente
router.put("/:id_reporte", authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO', 'TECNICO'], 'reportes'), upload.single("archivo_adjunto"), async (req, res) => {
  const { id_reporte } = req.params;
  const {
    fecha_reporte,
    ubicacion,
    id_tipo_trabajo,
    id_tension,
    id_usuario,
    id_cuadrilla,
    descripcion,
    status_reporte,
    revisado_por,
    fecha_revision,
    trabajadores_incidente,
    fecha_incidente,
    id_tipo_incidente,
    id_gravedad
  } = req.body;

  const archivo_adjunto = req.file ? req.file.filename : null;

  if (!fecha_reporte || !ubicacion || !id_tipo_trabajo || !id_tension || !id_usuario || !id_cuadrilla) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  let trabajadoresArray = [];
  try {
    if (trabajadores_incidente) {
      trabajadoresArray = JSON.parse(trabajadores_incidente);
    }
  } catch (error) {
    return res.status(400).json({ error: "Formato inválido en trabajadores_incidente" });
  }

  const conn = await db.getConnection();
  try {
    // 1. Obtener datos existentes
    const [reporteActualRows] = await conn.query(
      `SELECT 
         r.fecha_reporte,
         r.ubicacion,
         r.id_tipo_trabajo,
         r.id_tension,
         r.id_usuario,
         r.id_cuadrilla,
         r.descripcion,
         r.archivo_adjunto,
         i.fecha_incidente,
         i.fecha_revision,
         i.id_tipo_incidente,
         i.id_gravedad,
         i.status AS status_reporte,
         i.revisado_por
       FROM reportes r
       LEFT JOIN incidentes i ON r.id_reporte = i.id_reporte
       WHERE r.id_reporte = ?`,
      [id_reporte]
    );

    if (reporteActualRows.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Reporte no encontrado" });
    }

    const anterior = reporteActualRows[0];

    const [trabajadoresActuales] = await conn.query(
      `SELECT id_trabajador, rol_en_incidente, observaciones
       FROM trabajador_incidente
       WHERE id_reporte = ?`,
      [id_reporte]
    );

    await conn.beginTransaction();

    // 2. Actualizar reporte
    let queryReporte = `
      UPDATE reportes SET
        fecha_reporte = ?,
        ubicacion = ?,
        id_tipo_trabajo = ?,
        id_tension = ?,
        id_usuario = ?,
        id_cuadrilla = ?,
        descripcion = ?`;
    const paramsReporte = [
      fecha_reporte,
      ubicacion,
      id_tipo_trabajo,
      id_tension,
      id_usuario,
      id_cuadrilla,
      descripcion
    ];

    if (archivo_adjunto) {
      queryReporte += `, archivo_adjunto = ?`;
      paramsReporte.push(archivo_adjunto);
    }

    queryReporte += ` WHERE id_reporte = ?`;
    paramsReporte.push(id_reporte);

    await conn.query(queryReporte, paramsReporte);

    // 3. Actualizar o insertar incidente
    const [incidentRows] = await conn.query(
      "SELECT id_incidente FROM incidentes WHERE id_reporte = ?",
      [id_reporte]
    );

    if (incidentRows.length > 0) {
      await conn.query(
        `UPDATE incidentes SET
           fecha_incidente = ?,
           fecha_revision = ?,
           descripcion = ?,
           id_tipo_incidente = ?,
           id_gravedad = ?,
           status = ?,
           revisado_por = ?
         WHERE id_reporte = ?`,
        [
          fecha_incidente || fecha_reporte,
          fecha_revision || null,
          descripcion,
          id_tipo_incidente || 1,
          id_gravedad || 1,
          status_reporte || "Pendiente",
          revisado_por || null,
          id_reporte
        ]
      );
    } else {
      await conn.query(
        `INSERT INTO incidentes
           (fecha_incidente, descripcion, id_reporte, id_tipo_incidente, id_gravedad, status, revisado_por)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          fecha_incidente || fecha_reporte,
          descripcion,
          id_reporte,
          id_tipo_incidente || 1,
          id_gravedad || 1,
          status_reporte || "Pendiente",
          revisado_por || null
        ]
      );
    }

    // 4. Reemplazar trabajadores involucrados
    await conn.query(`DELETE FROM trabajador_incidente WHERE id_reporte = ?`, [id_reporte]);

    if (trabajadoresArray.length > 0) {
      const insertTrabajadores = trabajadoresArray.map(({ id_trabajador, rol_en_incidente, observaciones }) => [
        id_trabajador,
        id_reporte,
        rol_en_incidente || "Involucrado",
        observaciones || ""
      ]);
      await conn.query(
        `INSERT INTO trabajador_incidente (id_trabajador, id_reporte, rol_en_incidente, observaciones) VALUES ?`,
        [insertTrabajadores]
      );
    }

    await conn.commit();

    // 5. Detectar cambios y registrar en bitácora solo si hay cambios
    if (req.user?.id_usuario) {
      const mappingCampos = {
        fecha_reporte: "Fecha",
        ubicacion: "Ubicación",
        id_tipo_trabajo: "Tipo de trabajo",
        id_tension: "Rango de tensión",
        id_usuario: "Usuario asignado",
        id_cuadrilla: "Cuadrilla",
        descripcion: "Descripción",
        fecha_incidente: "Fecha del incidente",
        fecha_revision: "Fecha de revisión",
        id_tipo_incidente: "Tipo de incidente",
        id_gravedad: "Gravedad",
        status_reporte: "Estado del reporte",
        revisado_por: "Revisado por"
      };

      const nuevo = {
        fecha_reporte,
        ubicacion,
        id_tipo_trabajo,
        id_tension,
        id_usuario,
        id_cuadrilla,
        descripcion,
        fecha_incidente,
        fecha_revision,
        id_tipo_incidente,
        id_gravedad,
        status_reporte,
        revisado_por
      };

      const cambios = [];

      const parseDate = (value) => {
        if (!value) return "";
        try {
          const d = new Date(value);
          if (isNaN(d)) return "";
          return d.toISOString().split("T")[0];
        } catch {
          return "";
        }
      };

      const normalize = (value) => {
        if (value === null || value === undefined) return "";
        if (typeof value === "string") return value.trim().toLowerCase();
        return String(value).trim().toLowerCase();
      };

      const normalizeNumber = (value) => {
        if (value === null || value === undefined || value === "") return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };

      for (const [campo, nombre] of Object.entries(mappingCampos)) {
        let anteriorValor = anterior[campo];
        let nuevoValor = nuevo[campo];

        if (campo.toLowerCase().includes("fecha")) {
          anteriorValor = parseDate(anteriorValor);
          nuevoValor = parseDate(nuevoValor);
        } else if (typeof anteriorValor === "number" || typeof nuevoValor === "number" || campo.toLowerCase().includes("id")) {
          anteriorValor = normalizeNumber(anteriorValor);
          nuevoValor = normalizeNumber(nuevoValor);
        } else {
          anteriorValor = normalize(anteriorValor);
          nuevoValor = normalize(nuevoValor);
        }

        if (anteriorValor !== nuevoValor) {
          cambios.push(nombre);
        }
      }

      // Comparar archivo adjunto
      if (archivo_adjunto && archivo_adjunto !== anterior.archivo_adjunto) {
        cambios.push("Archivo adjunto");
      }

      // Comparar trabajadores
      const normalizeText = (txt) => (txt || "").trim().toLowerCase();

      const trabajadoresEditados = () => {
        if (trabajadoresActuales.length !== trabajadoresArray.length) return true;

        const sortFn = (a, b) => a.id_trabajador - b.id_trabajador;

        const actuales = trabajadoresActuales.map(t => ({
          id_trabajador: Number(t.id_trabajador),
          rol_en_incidente: normalizeText(t.rol_en_incidente),
          observaciones: normalizeText(t.observaciones),
        })).sort(sortFn);

        const nuevos = trabajadoresArray.map(t => ({
          id_trabajador: Number(t.id_trabajador),
          rol_en_incidente: normalizeText(t.rol_en_incidente),
          observaciones: normalizeText(t.observaciones),
        })).sort(sortFn);

        for (let i = 0; i < actuales.length; i++) {
          const a = actuales[i];
          const n = nuevos[i];
          if (
            a.id_trabajador !== n.id_trabajador ||
            a.rol_en_incidente !== n.rol_en_incidente ||
            a.observaciones !== n.observaciones
          ) {
            return true;
          }
        }
        return false;
      };

      if (trabajadoresEditados()) {
        cambios.push("Trabajadores");
        cambios.push("Rol");
        cambios.push("Observaciones");
      }

      const camposUnicos = [...new Set(cambios)];

      if (camposUnicos.length > 0) {
        let mensaje = `Reporte editado (ID: ${id_reporte}) | ${camposUnicos.join(", ")}`;
        await registrarBitacora(req.user.id_usuario, mensaje);
      }
      // Si no hay cambios, no registra nada
    }

    res.json({ message: "Reporte e incidente actualizados exitosamente" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Error al actualizar reporte e incidente" });
  } finally {
    conn.release();
  }
});

//Eliminar reporte e incidentes relacionados
router.delete("/:id_reporte", authMiddleware(['MASTER', 'ADMINISTRADOR', 'SISO', 'TECNICO'], 'reportes'), async (req, res) => {
  const { id_reporte } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Obtener el nombre del archivo adjunto antes de borrar
    const [resultadoArchivo] = await conn.query(
      "SELECT archivo_adjunto FROM reportes WHERE id_reporte = ?",
      [id_reporte]
    );

    if (resultadoArchivo.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Reporte no encontrado" });
    }

    const archivoAdjunto = resultadoArchivo[0].archivo_adjunto;

    // Eliminar relaciones trabajador_incidente primero
    await conn.query("DELETE FROM trabajador_incidente WHERE id_reporte = ?", [id_reporte]);

    // Eliminar incidente asociado
    await conn.query("DELETE FROM incidentes WHERE id_reporte = ?", [id_reporte]);

    // Eliminar reporte
    await conn.query("DELETE FROM reportes WHERE id_reporte = ?", [id_reporte]);

    await conn.commit();

    // Borrar archivo físico después del commit (para no afectar la transacción)
    borrarArchivo(archivoAdjunto);

    if (req.user?.id_usuario) {
      await registrarBitacora(
        req.user.id_usuario,
        `Reporte eliminado (ID: ${id_reporte})`
      );
    }

    res.json({ message: "Reporte eliminado exitosamente" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Error al eliminar reporte" });
  } finally {
    conn.release();
  }
});

//Obtener detalles completos de un reporte por ID
router.get("/:id_reporte/detalles", async (req, res) => {
  const { id_reporte } = req.params;

  try {
    //Datos generales del reporte
    const [reporteData] = await db.query(`
      SELECT 
        r.*,
        t.tipo_trabajo,
        tt.rango_tension,
        c.nombre_cuadrilla,
        CONCAT(u.nombres, ' ', u.apellidos) AS nombre_usuario,
        i.id_incidente,
        i.fecha_incidente,
        i.fecha_revision,
        i.descripcion AS descripcion_incidente,
        i.id_tipo_incidente,
        i.id_gravedad,
        i.status,
        i.revisado_por
      FROM reportes r
      LEFT JOIN incidentes i ON r.id_reporte = i.id_reporte
      JOIN tipo_trabajo t ON r.id_tipo_trabajo = t.id_tipo_trabajo
      JOIN trabajo_tension tt ON r.id_tension = tt.id_tension
      JOIN cuadrillas c ON r.id_cuadrilla = c.id_cuadrilla
      JOIN usuarios u ON r.id_usuario = u.id_usuario
      WHERE r.id_reporte = ?
    `, [id_reporte]);

    if (reporteData.length === 0) {
      return res.status(404).json({ error: "Reporte no encontrado" });
    }

    const reporte = reporteData[0];

    //Trabajadores involucrados
    const [trabajadores] = await db.query(`
      SELECT 
        ti.id_trabajador,
        ti.rol_en_incidente,
        ti.observaciones,
        t.nombres,
        t.apellidos
      FROM trabajador_incidente ti
      JOIN trabajadores t ON ti.id_trabajador = t.id_trabajador
      WHERE ti.id_reporte = ?
    `, [id_reporte]);

    //Retornar respuesta unificada
    res.json({
      ...reporte,
      trabajadores
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener detalles del reporte" });
  }
});

module.exports = router;
