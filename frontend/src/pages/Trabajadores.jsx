import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../assets/styles/4Trabajadores.module.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../assets/styles/Sidebar.css";

const GestionTrabajadores = () => {
  const navigate = useNavigate();

  const [trabajadores, setTrabajadores] = useState([]);
  const [cuadrillas, setCuadrillas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [formData, setFormData] = useState({
    codigo_trabajador: "",
    nombres: "",
    apellidos: "",
    puesto: "",
    id_cuadrilla: "",
  });

  const cargarTrabajadores = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/trabajadores", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTrabajadores(res.data);
    } catch (error) {
      console.error("Error al cargar trabajadores", error);
    }
  };

  const cargarCuadrillas = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/trabajadores/cuadrillas", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setCuadrillas(res.data);
    } catch (error) {
      console.error("Error al cargar cuadrillas", error);
    }
  };

  useEffect(() => {
    cargarTrabajadores();
    cargarCuadrillas();
  }, []);

  const handleBusquedaChange = (e) => setBusqueda(e.target.value);

  const trabajadoresFiltrados = trabajadores.filter((t) =>
    `${t.id_trabajador} ${t.codigo_trabajador} ${t.nombres} ${t.apellidos} ${t.puesto} ${t.nombre_cuadrilla}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const seleccionarTrabajador = (t) => {
    setTrabajadorSeleccionado(t);
    setFormData({
      codigo_trabajador: t.codigo_trabajador,
      nombres: t.nombres,
      apellidos: t.apellidos,
      puesto: t.puesto,
      id_cuadrilla: t.id_cuadrilla.toString(),
    });
    setMostrarFormulario(true);
  };

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const registrarTrabajador = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/trabajadores", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("Trabajador registrado");
      cargarTrabajadores();
      setMostrarFormulario(false);
      setTrabajadorSeleccionado(null);
      setFormData({
        codigo_trabajador: "",
        nombres: "",
        apellidos: "",
        puesto: "",
        id_cuadrilla: "",
      });
    } catch (error) {
      alert("Error al registrar trabajador");
      console.error(error);
    }
  };

  const editarTrabajador = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/trabajadores/${trabajadorSeleccionado.id_trabajador}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      alert("Trabajador actualizado");
      setMostrarFormulario(false);
      setTrabajadorSeleccionado(null);
      cargarTrabajadores();
      setFormData({
        codigo_trabajador: "",
        nombres: "",
        apellidos: "",
        puesto: "",
        id_cuadrilla: "",
      });
    } catch (error) {
      alert("Error al actualizar trabajador");
      console.error(error);
    }
  };

  const eliminarTrabajador = async () => {
    if (!trabajadorSeleccionado) {
      alert("Selecciona un trabajador");
      return;
    }
    if (!window.confirm("¿Seguro quieres eliminar este trabajador?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `/api/trabajadores/${trabajadorSeleccionado.id_trabajador}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      alert("Trabajador eliminado");
      setTrabajadorSeleccionado(null);
      cargarTrabajadores();
    } catch (error) {
      alert("Error al eliminar trabajador");
      console.error(error);
    }
  };

  return (
    <div className="dashboard-layout">
    <Sidebar colapsado={true} /> 
    <main className="main-content"> 
        <div className={styles.gestionContainer}>
          <h2 className={styles.titulo}>Gestión de Trabajadores</h2>

          <div className={styles.accionesSuperior}>
            <input
              type="text"
              placeholder="Buscar trabajador..."
              value={busqueda}
              onChange={handleBusquedaChange}
              className={styles.inputBuscar}
              disabled={mostrarFormulario}
            />

            {!mostrarFormulario ? (
              <button
                onClick={() => {
                  setMostrarFormulario(true);
                  setTrabajadorSeleccionado(null);
                  setFormData({
                    codigo_trabajador: "",
                    nombres: "",
                    apellidos: "",
                    puesto: "",
                    id_cuadrilla: "",
                  });
                }}
                className="btn-registrar"
              >
                Registrar
              </button>
            ) : (
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  setTrabajadorSeleccionado(null);
                  setFormData({
                    codigo_trabajador: "",
                    nombres: "",
                    apellidos: "",
                    puesto: "",
                    id_cuadrilla: "",
                  });
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
            )}

            <button
              onClick={() =>
                trabajadorSeleccionado
                  ? seleccionarTrabajador(trabajadorSeleccionado)
                  : alert("Selecciona un trabajador para editar")
              }
              className="btn-editar"
              disabled={mostrarFormulario}
            >
              Editar
            </button>
            <button
              onClick={() => {
                if (!trabajadorSeleccionado) {
                  alert("Selecciona un trabajador para eliminar");
                  return;
                }
                eliminarTrabajador();
              }}
              className="btn-eliminar"
              disabled={mostrarFormulario}
            >
              Eliminar
            </button>
            <button
              onClick={() => navigate("/Dashboard")}
              className="btn-regresar"
              disabled={mostrarFormulario}
            >
              Regresar
            </button>
          </div>

          {!mostrarFormulario && (
            <div className={styles.tablaWrapper}>
              <table className={styles.tablaUsuarios}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>Puesto</th>
                    <th>Cuadrilla</th>
                  </tr>
                </thead>
                <tbody>
                  {trabajadoresFiltrados.map((t) => (
                    <tr
                      key={t.id_trabajador}
                      className={
                        trabajadorSeleccionado?.id_trabajador === t.id_trabajador
                          ? styles.seleccionado
                          : ""
                      }
                      onClick={() => setTrabajadorSeleccionado(t)}
                      onDoubleClick={() => seleccionarTrabajador(t)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{t.id_trabajador}</td>
                      <td>{t.codigo_trabajador}</td>
                      <td>{t.nombres}</td>
                      <td>{t.apellidos}</td>
                      <td>{t.puesto}</td>
                      <td>{t.nombre_cuadrilla}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {mostrarFormulario && (
            <div className={styles.formContainer}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  trabajadorSeleccionado ? editarTrabajador() : registrarTrabajador();
                }}
                className={styles.formBox}
              >
                <h3>
                  {trabajadorSeleccionado
                    ? "Editar Trabajador"
                    : "Registrar Trabajador"}
                </h3>

                <input
                  type="text"
                  name="codigo_trabajador"
                  placeholder="Código Trabajador"
                  value={formData.codigo_trabajador}
                  onChange={handleFormChange}
                  required
                />
                <input
                  type="text"
                  name="nombres"
                  placeholder="Nombres"
                  value={formData.nombres}
                  onChange={handleFormChange}
                  required
                />
                <input
                  type="text"
                  name="apellidos"
                  placeholder="Apellidos"
                  value={formData.apellidos}
                  onChange={handleFormChange}
                  required
                />
                <input
                  type="text"
                  name="puesto"
                  placeholder="Puesto"
                  value={formData.puesto}
                  onChange={handleFormChange}
                  required
                />

                <select
                  name="id_cuadrilla"
                  value={formData.id_cuadrilla}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Asignar cuadrilla</option>
                  {cuadrillas.map((c) => (
                    <option key={c.id_cuadrilla} value={c.id_cuadrilla}>
                      {c.nombre_cuadrilla}
                    </option>
                  ))}
                </select>

                <div className={styles.botonesForm}>
                  <button
                    type="submit"
                    className={trabajadorSeleccionado ? "btn-editar" : "btn-registrar"}
                  >
                    {trabajadorSeleccionado ? "Guardar cambios" : "Registrar"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setTrabajadorSeleccionado(null);
                      setFormData({
                        codigo_trabajador: "",
                        nombres: "",
                        apellidos: "",
                        puesto: "",
                        id_cuadrilla: "",
                      });
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
  </div>
  );
};

export default GestionTrabajadores;
