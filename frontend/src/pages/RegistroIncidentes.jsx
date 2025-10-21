import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "..//assets/styles/5registroIncidentes.module.css";
import Sidebar from "../components/Sidebar";
import "../assets/styles/Sidebar.css";

const RegistroIncidentes = () => {
  const navigate = useNavigate();
  const usuarioSesion = JSON.parse(localStorage.getItem("usuario") || "{}");
  const idUsuarioSesion = usuarioSesion.id_usuario || "";
  const nombreCompleto = `${usuarioSesion.nombres || ""} ${usuarioSesion.apellidos || ""}`;

  const [reportes, setReportes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [listas, setListas] = useState({
    tiposTrabajo: [],
    tensiones: [],
    usuarios: [],
    cuadrillas: [],
  });

  const hoyLocal = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

  const [formData, setFormData] = useState({
    fecha_reporte: hoyLocal(),
    ubicacion: "",
    id_tipo_trabajo: "",
    id_tension: "",
    id_usuario: idUsuarioSesion,
    id_cuadrilla: "",
    descripcion: "",
    archivo_adjunto: null,
  });

    const formatearFecha = (fecha) => {
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const seleccionarReporte = async (reporte) => {
    if (reporte.status && reporte.status.toLowerCase() !== "pendiente") {
      alert("Este reporte ya fue clasificado y no puede ser editado.");
      await cargarTrabajadoresPorCuadrilla(reporte.id_cuadrilla, false);
      return;
    }

    try {
      const res = await axios.get(`/api/registro-incidentes/${reporte.id_reporte}/detalles`);
      const data = res.data;
      console.log("Detalle del reporte:", data);

      setReporteSeleccionado(data);

      setFormData({
        fecha_reporte: formatearFecha(data.fecha_reporte),
        ubicacion: data.ubicacion,
        id_tipo_trabajo: data.id_tipo_trabajo,
        id_tension: data.id_tension,
        id_usuario: data.id_usuario.toString(),
        id_cuadrilla: data.id_cuadrilla,
        descripcion: data.descripcion_incidente || data.descripcion || "",
        archivo_adjunto: null,
      });

      const trabajadoresMap = {};
      (data.trabajadores || []).forEach(t => {
        trabajadoresMap[t.id_trabajador] = {
          seleccionado: true,
          rol: t.rol_en_incidente || "",
          observaciones: t.observaciones || "",
        };
      });
      setTrabajadoresSeleccionados(trabajadoresMap);

      // Aquí pasar resetSeleccionados=false para evitar resetear trabajadoresSeleccionados
      await cargarTrabajadoresPorCuadrilla(data.id_cuadrilla, false);

      setMostrarFormulario(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      console.error("Error al obtener detalles del reporte:", err);
      alert("Error al cargar los detalles del reporte");
    }
  };

  const [previewArchivo, setPreviewArchivo] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  const [trabajadoresCuadrilla, setTrabajadoresCuadrilla] = useState([]);
  const [trabajadoresSeleccionados, setTrabajadoresSeleccionados] = useState({});

  useEffect(() => {
    cargarReportes();
    cargarListas();
    obtenerUbicacion();
  }, []);

  const obtenerUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData((prev) => ({
          ...prev,
          ubicacion: `${pos.coords.latitude}, ${pos.coords.longitude}`,
        }));
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "archivo_adjunto") {
      const file = files[0];
      setFormData({ ...formData, archivo_adjunto: file });

      // Generar preview solo si es imagen
      if (file && file.type.startsWith("image/")) {
        setPreviewArchivo(URL.createObjectURL(file));
      } else {
        setPreviewArchivo(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const cargarReportes = async () => {
    try {
      const res = await axios.get(`/api/registro-incidentes?usuario=${idUsuarioSesion}`);
      setReportes(res.data.sort((a, b) => a.id_reporte - b.id_reporte));
    } catch (error) {
      console.error(error);
    }
  };

  const cargarListas = async () => {
    try {
      const res = await axios.get("/api/registro-incidentes/listas");
      const usuariosFiltrados = res.data.usuarios.filter(
        (u) => u.id_usuario.toString() !== idUsuarioSesion.toString()
      );
      setListas({
        tiposTrabajo: res.data.tiposTrabajo,
        tensiones: res.data.tensiones,
        usuarios: usuariosFiltrados,
        cuadrillas: res.data.cuadrillas,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const cargarTrabajadoresPorCuadrilla = async (id_cuadrilla, resetSeleccionados = true) => {
    if (!id_cuadrilla) {
      setTrabajadoresCuadrilla([]);
      if (resetSeleccionados) setTrabajadoresSeleccionados({});
      return;
    }
    try {
      const res = await axios.get(
        `/api/registro-incidentes/trabajadores/${id_cuadrilla}`
      );
      setTrabajadoresCuadrilla(res.data);
      if (resetSeleccionados) setTrabajadoresSeleccionados({});
    } catch (error) {
      console.error(error);
      setTrabajadoresCuadrilla([]);
    }
  };

  const resetForm = (actualizarUbicacion = true) => {
    setFormData({
      fecha_reporte: hoyLocal(),
      ubicacion: "",
      id_tipo_trabajo: "",
      id_tension: "",
      id_usuario: idUsuarioSesion,
      id_cuadrilla: "",
      descripcion: "",
      archivo_adjunto: null,
    });
    setPreviewArchivo(null);
    setTrabajadoresCuadrilla([]);
    setTrabajadoresSeleccionados({});
    
    if (actualizarUbicacion) {
      obtenerUbicacion();
    }
  };

  const registrarReporte = async () => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) data.append(key, formData[key]);
      });

      const trabajadoresArray = Object.entries(trabajadoresSeleccionados)
        .filter(([, val]) => val.seleccionado)
        .map(([id, val]) => {
          if (!val.rol || val.rol.trim() === "") {
            throw new Error("Todos los trabajadores seleccionados deben tener un rol definido.");
          }
          return {
            id_trabajador: id,
            rol_en_incidente: val.rol,
            observaciones: val.observaciones,
          };
        });

      data.append("trabajadores_incidente", JSON.stringify(trabajadoresArray));
      const token = localStorage.getItem("token");

      await axios.post("/api/registro-incidentes", data, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}`, },
      });

      alert("Reporte registrado");
      setMostrarFormulario(false);
      cargarReportes();
      resetForm();
    } catch (error) {
      console.error(error);
      //alert("Error al registrar reporte");
      console.error("Error en registrarReporte:", error.response?.data || error.message);
      alert(`Error al registrar reporte: ${error.response?.data?.message || error.message}`);
    }
  };

  const editarReporte = async () => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) data.append(key, formData[key]);
      });

      const trabajadoresArray = Object.entries(trabajadoresSeleccionados)
        .filter(([, val]) => val.seleccionado)
        .map(([id, val]) => {
          if (!val.rol || val.rol.trim() === "") {
            throw new Error("Todos los trabajadores seleccionados deben tener un rol definido.");
          }
          return {
            id_trabajador: id,
            rol_en_incidente: val.rol,
            observaciones: val.observaciones,
          };
        });

      data.append("trabajadores_incidente", JSON.stringify(trabajadoresArray));

      const token = localStorage.getItem("token");

      await axios.put(
        `/api/registro-incidentes/${reporteSeleccionado.id_reporte}`,
        data,
        { headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`, 
        } 
      }
    );

      alert("Reporte actualizado");
      setMostrarFormulario(false);
      setReporteSeleccionado(null);
      cargarReportes();
      resetForm(false);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar reporte");
    }
  };

const eliminarReporte = async () => {
  if (!reporteSeleccionado) {
    alert("Selecciona un reporte para eliminar");
    return;
  }

  if (reporteSeleccionado.status && reporteSeleccionado.status.toLowerCase() !== "pendiente") {
    alert("Este reporte ya fue clasificado y no puede ser eliminado.");
    return;
  }

  if (!window.confirm("¿Seguro quieres eliminar este reporte?")) return;

  try {
    const token = localStorage.getItem("token"); 

    if (!token) {
      alert("No se encontró el token. Inicia sesión nuevamente.");
      return;
    }

    await axios.delete(
      `/api/registro-incidentes/${reporteSeleccionado.id_reporte}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      }
    );

    alert("Reporte eliminado");
    setReporteSeleccionado(null);
    cargarReportes(); 
  } catch (error) {
    console.error(error);
    alert("Error al eliminar reporte");
  }
};

  const reportesFiltrados = reportes.filter((r) =>
    `${r.id_reporte} ${r.fecha_reporte} ${r.ubicacion} ${r.tipo_trabajo} ${r.rango_tension} ${r.nombre_usuario} ${r.nombre_cuadrilla} ${r.status}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
    <Sidebar colapsado={true} /> 
    <main className="main-content"> 
        <div className={styles['gestion-containerRI']}>
          <h2>Registro de Incidentes</h2>
          <div className={styles['acciones-superior']}>
            <input
              type="text"
              placeholder="Buscar reporte..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles['input-buscar']}
            />

            <button
              onClick={() => {
                if (mostrarFormulario) {
                  setMostrarFormulario(false);
                  setReporteSeleccionado(null);
                  resetForm();
                } else {
                  setMostrarFormulario(true);
                }
              }}
              className="btn-registrar"
            >
              {mostrarFormulario ? "Cancelar" : "Registrar"}
            </button>

            <button
              onClick={async () => {
                if (!reporteSeleccionado) {
                  alert("Selecciona un reporte para editar");
                  return;
                }

                if (
                  reporteSeleccionado.status &&
                  reporteSeleccionado.status.toLowerCase() !== "pendiente"
                ) {
                  alert("Este reporte ya fue clasificado y no puede ser editado.");
                  return;
                }

                await seleccionarReporte(reporteSeleccionado);
              }}
              className="btn-editar"
            >
              Editar
            </button>

            <button
              onClick={eliminarReporte}
              className="btn-eliminar"
              disabled={!reporteSeleccionado}
            >
              Eliminar
            </button>

            <button onClick={() => navigate("/Dashboard")} className="btn-regresar">
              Regresar
            </button>
          </div>

          {!mostrarFormulario && (
            <div className={styles['tabla-wrapperRI']}>
              <table className={styles['tabla-reportesRI']}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Ubicación</th>
                    <th>Tipo Trabajo</th>
                    <th>Tensión</th>
                    <th>Usuario</th>
                    <th>Cuadrilla</th>
                    <th>Status</th>
                    <th>Revisado por</th>
                    <th>Fecha revisión</th>
                  </tr>
                </thead>
                <tbody>
                  {reportesFiltrados.map((r) => (
                    <tr
                      key={r.id_reporte}
                      className={reporteSeleccionado?.id_reporte === r.id_reporte ? styles.seleccionado : ""}
                      onClick={() => setReporteSeleccionado(r)}
                      onDoubleClick={() => seleccionarReporte(r)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{r.id_reporte}</td>
                      <td>{r.fecha_reporte ? r.fecha_reporte.slice(0, 10) : "-"}</td>
                      <td>{r.ubicacion}</td>
                      <td>{r.tipo_trabajo}</td>
                      <td>{r.rango_tension}</td>
                      <td>{r.nombre_usuario}</td>
                      <td>{r.nombre_cuadrilla}</td>
                      <td>{r.status || "Pendiente"}</td>
                      <td>{r.nombre_revisor || "-"}</td>
                      <td>{r.fecha_revision || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {mostrarFormulario && (
            <div className={styles['form-containerRI']}>
              <form
                className={styles['form-boxRI']}
                onSubmit={(e) => {
                  e.preventDefault();
                  reporteSeleccionado ? editarReporte() : registrarReporte();
                }}
              >
                <h3>{reporteSeleccionado ? "Editar Reporte" : "Registrar Reporte"}</h3>
                <input type="date" name="fecha_reporte" value={formData.fecha_reporte} onChange={handleFormChange} required />
                <input type="text" name="ubicacion" value={formData.ubicacion} readOnly required />
                <select name="id_tipo_trabajo" value={formData.id_tipo_trabajo} onChange={handleFormChange} required>
                  <option value="">Seleccione tipo de trabajo</option>
                  {listas.tiposTrabajo.map((t) => (
                    <option key={t.id_tipo_trabajo} value={t.id_tipo_trabajo}>{t.tipo_trabajo}</option>
                  ))}
                </select>
                <select name="id_tension" value={formData.id_tension} onChange={handleFormChange} required>
                  <option value="">Seleccione rango de tensión</option>
                  {listas.tensiones.map((t) => (
                    <option key={t.id_tension} value={t.id_tension}>{t.rango_tension}</option>
                  ))}
                </select>
                <select name="id_usuario" value={formData.id_usuario} disabled>
                  <option value={idUsuarioSesion}>{`Usuario ID: ${nombreCompleto}`}</option>
                </select>
                <select
                  name="id_cuadrilla"
                  value={formData.id_cuadrilla}
                  onChange={(e) => {
                    handleFormChange(e);
                    cargarTrabajadoresPorCuadrilla(e.target.value);
                  }}
                  required
                >
                  <option value="">Seleccione cuadrilla</option>
                  {listas.cuadrillas.map((c) => (
                    <option key={c.id_cuadrilla} value={c.id_cuadrilla}>{c.nombre_cuadrilla}</option>
                  ))}
                </select>
                <textarea name="descripcion" placeholder="Descripción del incidente" value={formData.descripcion} onChange={handleFormChange} required />
                {trabajadoresCuadrilla.length > 0 && (
                  <div className={styles['trabajadores-container']}>
                    <h4>Trabajadores involucrados</h4>
                    <table className={styles['trabajadores-table']}>
                      <thead>
                        <tr><th>Seleccionar</th><th>Nombre</th><th>Rol en incidente</th><th>Observaciones</th></tr>
                      </thead>
                      <tbody>
                        {trabajadoresCuadrilla.map((t) => (
                          <tr key={t.id_trabajador}>
                            <td>
                              <input
                                type="checkbox"
                                checked={trabajadoresSeleccionados[t.id_trabajador]?.seleccionado || false}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setTrabajadoresSeleccionados((prev) => ({
                                    ...prev,
                                    [t.id_trabajador]: {
                                      ...prev[t.id_trabajador],
                                      seleccionado: isChecked,
                                    },
                                  }));
                                }}
                              />
                            </td>
                            <td>{`${t.nombres} ${t.apellidos}`}</td>
                            <td>
                              <textarea
                                placeholder="Rol en incidente"
                                value={trabajadoresSeleccionados[t.id_trabajador]?.rol || ""}
                                onChange={(e) =>
                                  setTrabajadoresSeleccionados((prev) => ({
                                    ...prev,
                                    [t.id_trabajador]: {
                                      ...prev[t.id_trabajador],
                                      rol: e.target.value,
                                    },
                                  }))
                                }
                                disabled={!trabajadoresSeleccionados[t.id_trabajador]?.seleccionado}
                                rows={3}
                              />
                            </td>
                            <td>
                              <textarea
                                placeholder="Observaciones"
                                value={trabajadoresSeleccionados[t.id_trabajador]?.observaciones || ""}
                                onChange={(e) =>
                                  setTrabajadoresSeleccionados((prev) => ({
                                    ...prev,
                                    [t.id_trabajador]: {
                                      ...prev[t.id_trabajador],
                                      observaciones: e.target.value,
                                    },
                                  }))
                                }
                                disabled={!trabajadoresSeleccionados[t.id_trabajador]?.seleccionado}
                                rows={3}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <input
                      type="file"
                      name="archivo_adjunto"
                      accept="image/*,application/pdf"
                      onChange={handleFormChange}
                      required
                    />
                    {previewArchivo && (
                      <div className={styles['preview-container']}>
                        <p>Vista previa de la imagen:</p>
                        <img
                          src={previewArchivo}
                          alt="Vista previa"
                          style={{ maxWidth: "300px", maxHeight: "300px", marginTop: "10px" }}
                        />
                      </div>
                    )}
                  </div>
                )}
                <button type="submit" className="btn-registrar">
                  {reporteSeleccionado ? "Actualizar" : "Registrar"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
  </div>
  );
};

export default RegistroIncidentes;
