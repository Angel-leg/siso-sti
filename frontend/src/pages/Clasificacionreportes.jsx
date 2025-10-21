import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/ClasificacionReportes.module.css";
import Sidebar from "../components/Sidebar";
import "../assets/styles/Sidebar.css";

// Obtener nombre del usuario logueado
const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
const nombreCompleto = usuarioLogueado
  ? `${usuarioLogueado.nombres} ${usuarioLogueado.apellidos}`
  : "Desconocido";

    const token = localStorage.getItem('token');
    const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

const hoyLocal = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ClasificacionReportes = () => {
  const navigate = useNavigate();

  const [gravedadesFiltradas, setGravedadesFiltradas] = useState([]);

  const gravedadesPermitidasPorTipo = {
    "Condición Insegura": ["Leve"],
    "Acto Inseguro": ["Leve", "Moderada"],
    "Cuasiaccidente": ["Leve", "Moderada"],
    "Accidente": ["Leve", "Moderada", "Grave"],
  };
  
  const [incidentes, setIncidentes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [gravedades, setGravedades] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [incidenteSeleccionado, setIncidenteSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    fecha_incidente: hoyLocal(),
    descripcion: "",
    id_reporte: "",
    id_tipo_incidente: "",
    id_gravedad: "",
    status: "",
    revisado_por: "",
  });

  const [descripcionTipoSeleccionado, setDescripcionTipoSeleccionado] = useState("");
  const [descripcionGravedadSeleccionada, setDescripcionGravedadSeleccionada] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [incidentesRes, tiposRes, gravedadesRes, reportesRes] = await Promise.all([
        axios.get("/api/incidentes", config),
        axios.get("/api/incidentes/tipos", config),
        axios.get("/api/incidentes/gravedades", config),
        axios.get("/api/registro-incidentes", config),
      ]);

      setIncidentes(incidentesRes.data);
      setTipos(tiposRes.data);
      setGravedades(gravedadesRes.data);
      setReportes(reportesRes.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const reportesCombinados = reportes.map((reporte) => {
    const incidenteRelacionado = incidentes.find((inc) => inc.id_reporte === reporte.id_reporte);
    const tipoRelacionado = tipos.find((t) => t.id_tipo_incidente === incidenteRelacionado?.id_tipo_incidente);
    const gravedadRelacionado = gravedades.find((g) => g.id_gravedad === incidenteRelacionado?.id_gravedad);

    return {
      ...reporte,
      id_incidente: incidenteRelacionado?.id_incidente || null,
      id_tipo_incidente: incidenteRelacionado?.id_tipo_incidente || "",
      id_gravedad: incidenteRelacionado?.id_gravedad || "",
      fecha_revision: incidenteRelacionado?.fecha_revision || "-",
      fecha_reporte: reporte.fecha_reporte || "-",
      descripcion: reporte.descripcion,
      trabajador_involucrado: reporte.trabajador_involucrado || "-",
      tipo_incidente_nombre: tipoRelacionado?.tipo_incidente || "-",
      gravedad_nombre: gravedadRelacionado?.nivel || "-",
      status: incidenteRelacionado?.status || "Pendiente",
      revisado_por: incidenteRelacionado?.revisado_por || "-",
      archivo_adjunto: reporte.archivo_adjunto || null,
    };
  });

  const reportesFiltrados = reportesCombinados.filter((r) =>
    (
      `${r.id_incidente} ${r.fecha_reporte} ${r.descripcion} ${r.id_reporte} ${r.tipo_incidente_nombre} ${r.gravedad_nombre} ${r.status} ${r.revisado_por} ${r.fecha_revision}`
    )
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const seleccionarReporte = (reporte) => {
    setIncidenteSeleccionado(reporte);

    setFormData({
      fecha_incidente: hoyLocal(),
      descripcion: reporte.descripcion,
      id_reporte: reporte.id_reporte,
      id_tipo_incidente: reporte.id_tipo_incidente || "",
      id_gravedad: reporte.id_gravedad || "",
      status: reporte.status,
      revisado_por: nombreCompleto,
    });

    const tipo = tipos.find((t) => t.id_tipo_incidente === reporte.id_tipo_incidente);
    setDescripcionTipoSeleccionado(tipo?.descripcion || "");

    const gravedad = gravedades.find((g) => g.id_gravedad === reporte.id_gravedad);
    setDescripcionGravedadSeleccionada(gravedad?.descripcion || "");

    setMostrarFormulario(true);
  };

  const abrirModalDetalles = async (reporte) => {
    try {
      const res = await axios.get(`/api/registro-incidentes/${reporte.id_reporte}/detalles`, config);
      setReporteSeleccionado(res.data);
      setModalVisible(true);
    } catch (error) {
      console.error("Error al cargar detalles del reporte:", error);
      alert("No se pudo cargar el detalle del reporte.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    if (name === "id_tipo_incidente") {
      const tipoSeleccionado = tipos.find((t) => t.id_tipo_incidente.toString() === value);
      setDescripcionTipoSeleccionado(tipoSeleccionado?.descripcion || "");

      // Actualizar gravedades permitidas según el tipo
      const nombreTipo = tipoSeleccionado?.tipo_incidente;
      const permitidas = gravedades.filter((g) =>
        gravedadesPermitidasPorTipo[nombreTipo]?.includes(g.nivel)
      );
      setGravedadesFiltradas(permitidas);

      // Resetear la gravedad si ya no es válida
      const gravedadActual = gravedades.find((g) => g.id_gravedad.toString() === updatedForm.id_gravedad);
      if (!permitidas.some((g) => g.id_gravedad === gravedadActual?.id_gravedad)) {
        setFormData((prev) => ({ ...prev, id_gravedad: "" }));
        setDescripcionGravedadSeleccionada("");
      }
    }

    if (name === "id_gravedad") {
      const gravedad = gravedades.find((g) => g.id_gravedad.toString() === value);
      setDescripcionGravedadSeleccionada(gravedad?.descripcion || "");
    }
  };

  const registrarOActualizarIncidente = async () => {
    const tipo = tipos.find((t) => t.id_tipo_incidente === parseInt(formData.id_tipo_incidente));
    const gravedad = gravedades.find((g) => g.id_gravedad === parseInt(formData.id_gravedad));

    const gravedadesPermitidas = gravedadesPermitidasPorTipo[tipo?.tipo_incidente] || [];

    if (!gravedadesPermitidas.includes(gravedad?.nivel)) {
      alert("La gravedad seleccionada no es válida para el tipo de incidente.");
      return;
    }

    try {
      const dataEnviar = {
        ...formData,
        id_tipo_incidente: parseInt(formData.id_tipo_incidente),
        id_gravedad: parseInt(formData.id_gravedad),
        revisado_por: nombreCompleto,
        status: formData.status,
      };

      let idIncidenteFinal = incidenteSeleccionado?.id_incidente;

      if (idIncidenteFinal) {
        await axios.put(`/api/incidentes/${idIncidenteFinal}`, dataEnviar, config);
        alert("Incidente actualizado");
      } else {
        const res = await axios.post("/api/incidentes", dataEnviar, config);
        alert("Incidente registrado");
        idIncidenteFinal = res.data?.id_incidente; 
      }

      //Reinicio automático del contador si es accidente
      if (tipo?.tipo_incidente === "Accidente") {
        try {
          await axios.post("/api/contador/reiniciar-por-incidente", {
            id_incidente: idIncidenteFinal,
            fecha_incidente: incidenteSeleccionado.fecha_reporte,
            id_usuario: usuarioLogueado.id_usuario,
          }, config);
          alert("Contador reiniciado automáticamente por accidente.");
        } catch (error) {
          console.error("Error al reiniciar contador automáticamente:", error);
          alert("No se pudo reiniciar el contador automáticamente.");
        }
      }

      await cargarDatos();
      resetFormulario();
    } catch (error) {
      console.error("Error al guardar incidente:", error);
      alert("Hubo un error");
    }
  };

  const resetFormulario = () => {
    setFormData({
      fecha_incidente: hoyLocal(),
      descripcion: "",
      id_reporte: "",
      id_tipo_incidente: "",
      id_gravedad: "",
      status: "",
      revisado_por: "",
    });

    setIncidenteSeleccionado(null);
    setMostrarFormulario(false);
    setDescripcionTipoSeleccionado("");
    setDescripcionGravedadSeleccionada("");
  };

  return (
    <div className="dashboard-layout">
    <Sidebar colapsado={true} /> 
    <main className="main-content"> 
          <div className={styles["clasificacion-container"]}>
            <h2>Clasificación de Incidentes</h2>

            <div className={styles["acciones-superior"]}>
              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles["input-buscar"]}
                disabled={mostrarFormulario}
              />

              {!mostrarFormulario ? (
                <button
                  onClick={() =>
                    incidenteSeleccionado
                      ? seleccionarReporte(incidenteSeleccionado)
                      : alert("Selecciona un reporte")
                  }
                  className="btn-editar"
                >
                  Editar
                </button>
              ) : (
                <button onClick={resetFormulario} className="btn-cancelar">
                  Cancelar
                </button>
              )}

              <button
                className="btn-regresar"
                onClick={() => navigate("/Dashboard")}
                disabled={mostrarFormulario}
              >
                Regresar
              </button>
            </div>

            {!mostrarFormulario ? (
              <div className={styles["tabla-wrapper"]}>
                <table className={styles["tabla-incidentes"]}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha Reporte</th>
                      <th>Descripción</th>
                      <th>ID Reporte</th>
                      <th>Tipo Incidente</th>
                      <th>Gravedad</th>
                      <th>Status</th>
                      <th>Revisado por</th>
                      <th>Fecha Revisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportesFiltrados.map((r) => (
                      <tr
                        key={r.id_reporte}
                        className={incidenteSeleccionado?.id_reporte === r.id_reporte ? styles["seleccionado"] : ""}
                        onClick={() => setIncidenteSeleccionado(r)}
                        onDoubleClick={() => seleccionarReporte(r)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{r.id_incidente || "-"}</td>
                        <td>{r.fecha_reporte ? r.fecha_reporte.slice(0, 10) : "-"}</td>
                        <td>{r.descripcion}</td>
                        <td>
                          {r.id_reporte}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirModalDetalles(r);
                            }}
                            title="Ver detalles"
                            style={{ marginLeft: "6px", cursor: "pointer" }}
                          >
                            Detalles
                          </button>
                        </td>
                        <td>{r.tipo_incidente_nombre}</td>
                        <td>{r.gravedad_nombre}</td>
                        <td>{r.status}</td>
                        <td>{r.revisado_por}</td>
                        <td>{r.fecha_revision ? r.fecha_revision.slice(0, 10) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles["form-container"]}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    registrarOActualizarIncidente();
                  }}
                  className={styles["form-box"]}
                >
                  <h3>{incidenteSeleccionado?.id_incidente ? "Editar Incidente" : "Registrar Incidente"}</h3>

                  <input
                    type="date"
                    name="fecha_incidente"
                    value={formData.fecha_incidente}
                    onChange={handleFormChange}
                    required
                  />

                  <input type="text" name="descripcion" value={formData.descripcion} readOnly required />
                  <input type="text" name="id_reporte" value={formData.id_reporte} readOnly />

                  <select
                    name="id_tipo_incidente"
                    value={formData.id_tipo_incidente}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Tipo de incidente</option>
                    {tipos.map((t) => (
                      <option key={t.id_tipo_incidente} value={t.id_tipo_incidente}>
                        {t.tipo_incidente}
                      </option>
                    ))}
                  </select>
                  {descripcionTipoSeleccionado && (
                    <p className={styles.descripcion}>Descripción: {descripcionTipoSeleccionado}</p>
                  )}

                  <select
                    name="id_gravedad"
                    value={formData.id_gravedad}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Gravedad</option>
                    {(gravedadesFiltradas.length > 0 ? gravedadesFiltradas : gravedades).map((g) => (
                      <option key={g.id_gravedad} value={g.id_gravedad}>
                        {g.nivel}
                      </option>
                    ))}
                  </select>
                  {descripcionGravedadSeleccionada && (
                    <p className={styles.descripcion}>Descripción: {descripcionGravedadSeleccionada}</p>
                  )}

                  <select name="status" value={formData.status} onChange={handleFormChange} required>
                    <option value="">Status</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Revisado">Revisado</option>
                    <option value="Completado">Completado</option>
                  </select>

                  <input type="text" name="revisado_por" value={formData.revisado_por} readOnly />

                  <div className={styles["botones-form"]}>
                    <button type="submit">Guardar</button>
                    <button type="button" onClick={resetFormulario}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modalVisible && reporteSeleccionado && (
              <div className={styles["modal-overlay"]}>
                <div className={styles["modal-contenido"]}>
                  <p><strong>ID Reporte:</strong> {reporteSeleccionado.id_reporte}</p>
                  <p><strong>Fecha Reporte:</strong> {reporteSeleccionado.fecha_reporte}</p>
                  <p><strong>Ubicación:</strong> {reporteSeleccionado.ubicacion}</p>
                  <p><strong>Cuadrilla:</strong> {reporteSeleccionado.nombre_cuadrilla}</p>
                  <p><strong>Reportado por:</strong> {reporteSeleccionado.nombre_usuario}</p>

                  <hr />

                  <p><strong>Descripción Incidente:</strong> {reporteSeleccionado.descripcion_incidente}</p>
                  <p><strong>Fecha Incidente:</strong> {reporteSeleccionado.fecha_incidente}</p>
                  <p><strong>Fecha Revisión:</strong> {reporteSeleccionado.fecha_revision || "-"}</p>
                  <p><strong>Status:</strong> {reporteSeleccionado.status}</p>
                  <p><strong>Revisado por:</strong> {reporteSeleccionado.revisado_por || "-"}</p>

                  <hr />

                  <h4>Trabajadores Involucrados:</h4>
                  {reporteSeleccionado.trabajadores?.length > 0 ? (
                    <ul>
                      {reporteSeleccionado.trabajadores.map((t) => (
                        <li key={t.id_trabajador}>
                          {t.nombres} {t.apellidos} — Rol: {t.rol_en_incidente}, Obs: {t.observaciones || "N/A"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay trabajadores registrados.</p>
                  )}

                  {reporteSeleccionado.archivo_adjunto && (
                    <>
                      <h4>Archivo Adjunto:</h4>
                      {reporteSeleccionado.archivo_adjunto.endsWith(".pdf") ? (
                        <iframe
                          src={`/uploads/${reporteSeleccionado.archivo_adjunto}`}
                          width="100%"
                          height="400px"
                          title="Archivo PDF"
                        />
                      ) : (
                        <img
                          src={`/uploads/${reporteSeleccionado.archivo_adjunto}`}
                          alt="Adjunto"
                          style={{ maxWidth: "100%", maxHeight: "400px" }}
                        />
                      )}
                    </>
                  )}

                  <button onClick={() => setModalVisible(false)}>Cerrar</button>
                </div>
              </div>
            )}
          </div>
        </main>
  </div>
  );
};

export default ClasificacionReportes;
