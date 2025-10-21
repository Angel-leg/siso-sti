library(plumber)
library(DBI)
library(RMariaDB)
library(jsonlite)

# Función para abrir la conexión a la base de datos
get_connection <- function() {
  dbConnect(
    RMariaDB::MariaDB(),
    user = Sys.getenv("DB_USER"),
    password = Sys.getenv("DB_PASS"),
    host = Sys.getenv("DB_HOST"),
    dbname = Sys.getenv("DB_NAME")
  )
}

# CORS filter
#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  } else {
    plumber::forward()
  }
}

#* Incidentes por semana
#* @get /apis/incidentes-por-semana
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT YEAR(fecha_incidente) AS anio,
           WEEK(fecha_incidente, 1) AS semana,
           COUNT(*) AS total_incidentes
    FROM incidentes
    WHERE fecha_incidente IS NOT NULL
    GROUP BY anio, semana
    ORDER BY anio, semana
  ")
  data
}

#* Total de incidentes
#* @get /apis/total-incidentes
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  total <- dbGetQuery(con, "SELECT COUNT(*) AS total FROM incidentes")
  list(total = total$total)
}

#* Días sin accidentes actual
#* @get /apis/dias-sin-accidentes
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  
  # Tomar el último contador iniciado
  data <- dbGetQuery(con, "
    SELECT fecha_de_inicio, fecha_fin, dias_totales
    FROM dias_sin_accidentes
    ORDER BY fecha_de_inicio DESC
    LIMIT 1
  ")
  
  if (nrow(data) == 0) {
    return(list(dias_sin_accidentes = 0))
  }
  
  # Si ya hay fecha_fin y dias_totales registrados, usar eso
  if (!is.na(data$fecha_fin) && !is.na(data$dias_totales)) {
    return(list(dias_sin_accidentes = data$dias_totales))
  }
  
  # Si aún no hay fecha de fin ni total (contador sigue activo)
  dias <- as.numeric(Sys.Date() - as.Date(data$fecha_de_inicio))
  return(list(dias_sin_accidentes = dias))
}

#* Cuadrilla con más incidentes
#* @get /apis/cuadrilla-mas-incidentes
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT c.nombre_cuadrilla, COUNT(*) AS total
    FROM incidentes i
    JOIN reportes r ON i.id_reporte = r.id_reporte
    JOIN cuadrillas c ON r.id_cuadrilla = c.id_cuadrilla
    GROUP BY c.nombre_cuadrilla
    ORDER BY total DESC
    LIMIT 1
  ")
  
  if (nrow(data) == 0) {
    return(list(nombre_cuadrilla = "", total = 0))
  } else {
    return(as.list(data[1, ]))
  }
}

#* Trabajador con más incidentes
#* @get /apis/trabajador-mas-incidentes
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT tr.nombres, tr.apellidos, COUNT(*) AS total
    FROM trabajador_incidente ti
    JOIN trabajadores tr ON ti.id_trabajador = tr.id_trabajador
    GROUP BY tr.id_trabajador
    ORDER BY total DESC
    LIMIT 1
  ")
  
  if (nrow(data) == 0) {
    # No hay datos: devolver objeto con valores por defecto
    return(list(nombres = "", apellidos = "", total = 0))
  } else {
    return(as.list(data[1, ]))
  }
}

#* Tendencia mensual de incidentes
#* @get /apis/tendencia-mensual
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT YEAR(fecha_incidente) AS anio,
           MONTH(fecha_incidente) AS mes,
           COUNT(*) AS total
    FROM incidentes
    WHERE fecha_incidente IS NOT NULL
    GROUP BY anio, mes
    ORDER BY anio, mes
  ")
  data
}

#* Incidentes por cuadrilla
#* @get /apis/incidentes-por-cuadrilla
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT c.nombre_cuadrilla, COUNT(*) AS total
    FROM incidentes i
    JOIN reportes r ON i.id_reporte = r.id_reporte
    JOIN cuadrillas c ON r.id_cuadrilla = c.id_cuadrilla
    GROUP BY c.nombre_cuadrilla
    ORDER BY total DESC
  ")
  data
}

#* Incidentes por tipo
#* @get /apis/incidentes-por-tipo
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT t.tipo_incidente, COUNT(*) AS total
    FROM incidentes i
    JOIN tipo_incidente t ON i.id_tipo_incidente = t.id_tipo_incidente
    GROUP BY t.tipo_incidente
    ORDER BY total DESC
  ")
  data
}

#* Top 10 trabajadores con más incidentes
#* @get /apis/top-trabajadores
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT tr.nombres, tr.apellidos, COUNT(*) AS total
    FROM trabajador_incidente ti
    JOIN trabajadores tr ON ti.id_trabajador = tr.id_trabajador
    GROUP BY tr.id_trabajador
    ORDER BY total DESC
    LIMIT 10
  ")
  data
}

#* Días sin accidentes histórico
#* @get /apis/dias-sin-accidentes-historico
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT fecha_de_inicio AS fecha, dias_totales AS dias_sin_accidentes
    FROM dias_sin_accidentes
    ORDER BY fecha_de_inicio
  ")
  data
}

#* Tasa de incidentes por cuadrilla
#* @get /apis/tasa-incidentes-por-cuadrilla
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  dbGetQuery(con, "
    SELECT c.nombre_cuadrilla, 
           COUNT(i.id_incidente) AS total_incidentes,
           COUNT(DISTINCT tr.id_trabajador) AS total_trabajadores,
           ROUND(COUNT(i.id_incidente) / COUNT(DISTINCT tr.id_trabajador), 2) AS tasa_incidentes
    FROM cuadrillas c
    LEFT JOIN reportes r ON c.id_cuadrilla = r.id_cuadrilla
    LEFT JOIN incidentes i ON r.id_reporte = i.id_reporte
    LEFT JOIN trabajadores tr ON c.id_cuadrilla = tr.id_cuadrilla
    GROUP BY c.id_cuadrilla
    ORDER BY tasa_incidentes DESC
  ")
}

#* Frecuencia de tipos de incidentes por mes
#* @get /apis/frecuencia-tipos-mensual
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  dbGetQuery(con, "
    SELECT YEAR(i.fecha_incidente) AS anio,
           MONTH(i.fecha_incidente) AS mes,
           t.tipo_incidente,
           COUNT(*) AS total
    FROM incidentes i
    JOIN tipo_incidente t ON i.id_tipo_incidente = t.id_tipo_incidente
    WHERE i.fecha_incidente IS NOT NULL
    GROUP BY anio, mes, t.tipo_incidente
    ORDER BY anio, mes, total DESC
  ")
}

#* Gravedad promedio por cuadrilla
#* @get /apis/gravedad-promedio-cuadrilla
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  dbGetQuery(con, "
    SELECT c.nombre_cuadrilla,
           ROUND(AVG(
             CASE g.nivel
               WHEN 'Leve' THEN 1
               WHEN 'Moderada' THEN 2
               WHEN 'Grave' THEN 3
             END
           ), 2) AS gravedad_promedio
    FROM incidentes i
    JOIN gravedad_incidente g ON i.id_gravedad = g.id_gravedad
    JOIN reportes r ON i.id_reporte = r.id_reporte
    JOIN cuadrillas c ON r.id_cuadrilla = c.id_cuadrilla
    GROUP BY c.nombre_cuadrilla
    ORDER BY gravedad_promedio DESC
  ")
}

#* Tiempo promedio de revisión de incidentes
#* @get /apis/tiempo-promedio-revision
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT ROUND(AVG(DATEDIFF(fecha_revision, fecha_incidente)), 2) AS promedio_dias_revision
    FROM incidentes
    WHERE fecha_incidente IS NOT NULL AND fecha_revision IS NOT NULL
  ")

  if (nrow(data) == 0) {
    return(list(promedio_dias_revision = NA))
  } else {
    return(as.list(data[1, ]))
  }
}

#* Incidentes por zona de trabajo
#* @get /apis/incidentes-por-zona
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  dbGetQuery(con, "
    SELECT c.zona_de_trabajo, COUNT(*) AS total_incidentes
    FROM incidentes i
    JOIN reportes r ON i.id_reporte = r.id_reporte
    JOIN cuadrillas c ON r.id_cuadrilla = c.id_cuadrilla
    GROUP BY c.zona_de_trabajo
    ORDER BY total_incidentes DESC
  ")
}

#* Usuario con más reportes generados
#* @get /apis/usuario-mas-reportes
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT u.nombres, u.apellidos, COUNT(*) AS total_reportes
    FROM reportes r
    JOIN usuarios u ON r.id_usuario = u.id_usuario
    GROUP BY u.id_usuario
    ORDER BY total_reportes DESC
    LIMIT 1
  ")
  
  if (nrow(data) == 0) {
    return(list(nombres = "", apellidos = "", total_reportes = 0))
  } else {
    return(as.list(data[1, ]))
  }
}

#* Promedio de días sin accidentes entre incidentes
#* @get /apis/promedio-dias-sin-accidentes
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  data <- dbGetQuery(con, "
    SELECT fecha_de_inicio, fecha_fin, dias_totales
    FROM dias_sin_accidentes
    WHERE dias_totales IS NOT NULL
  ")

  if (nrow(data) == 0) {
    return(list(promedio_dias = NA))
  } else {
    promedio <- round(mean(data$dias_totales, na.rm = TRUE), 2)
    return(list(promedio_dias = promedio))
  }
}

#* Top 5 causas (tipos) más comunes
#* @get /apis/top-causas-incidentes
function() {
  con <- get_connection()
  on.exit(dbDisconnect(con))
  dbGetQuery(con, "
    SELECT t.tipo_incidente, COUNT(*) AS total
    FROM incidentes i
    JOIN tipo_incidente t ON i.id_tipo_incidente = t.id_tipo_incidente
    GROUP BY t.tipo_incidente
    ORDER BY total DESC
    LIMIT 5
  ")
}

