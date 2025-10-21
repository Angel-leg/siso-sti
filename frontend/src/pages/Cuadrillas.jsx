import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "..//assets/styles/3Cuadrillas.module.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../assets/styles/Sidebar.css";

const GestionCuadrillas = () => {
  const navigate = useNavigate();

  const [cuadrillas, setCuadrillas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cuadrillaSeleccionada, setCuadrillaSeleccionada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    no_unidad: "",
    nombre_cuadrilla: "",
    zona_de_trabajo: "",
  });

  const token = localStorage.getItem('token');
  const config = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

  // Cargar cuadrillas
  const cargarCuadrillas = async () => {
    try {
      const res = await axios.get("/api/cuadrillas", config);
      setCuadrillas(res.data);
    } catch (error) {
      console.error("Error al cargar cuadrillas", error);
    }
  };

  useEffect(() => {
    cargarCuadrillas();
  }, []);

  // Manejar búsqueda
  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  // Filtrar cuadrillas
  const cuadrillasFiltradas = cuadrillas.filter((c) =>
    `${c.id_cuadrilla} ${c.no_unidad} ${c.nombre_cuadrilla} ${c.zona_de_trabajo}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // Seleccionar cuadrilla para editar
  const seleccionarCuadrilla = (cuadrilla) => {
    setCuadrillaSeleccionada(cuadrilla);
    setFormData({
      no_unidad: cuadrilla.no_unidad,
      nombre_cuadrilla: cuadrilla.nombre_cuadrilla,
      zona_de_trabajo: cuadrilla.zona_de_trabajo,
    });
    setMostrarFormulario(true);
  };

  // Manejar cambio en formulario
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Registrar nueva cuadrilla
  const registrarCuadrilla = async () => {
    try {
      await axios.post("/api/cuadrillas", formData, config);
      alert("Cuadrilla registrada");
      setMostrarFormulario(false);
      cargarCuadrillas();
      setFormData({ no_unidad: "", nombre_cuadrilla: "", zona_de_trabajo: "" });
    } catch (error) {
      alert("Error al registrar cuadrilla");
      console.error(error);
    }
  };

  // Editar cuadrilla
  const editarCuadrilla = async () => {
    try {
      await axios.put(
        `/api/cuadrillas/${cuadrillaSeleccionada.id_cuadrilla}`,
        formData, config
      );
      alert("Cuadrilla actualizada");
      setMostrarFormulario(false);
      setCuadrillaSeleccionada(null);
      cargarCuadrillas();
      setFormData({ no_unidad: "", nombre_cuadrilla: "", zona_de_trabajo: "" });
    } catch (error) {
      alert("Error al actualizar cuadrilla");
      console.error(error);
    }
  };

  // Eliminar cuadrilla
  const eliminarCuadrilla = async () => {
    if (!cuadrillaSeleccionada) {
      alert("Selecciona una cuadrilla para eliminar");
      return;
    }
    if (!window.confirm("¿Seguro quieres eliminar esta cuadrilla?")) return;

    try {
      await axios.delete(
        `/api/cuadrillas/${cuadrillaSeleccionada.id_cuadrilla}`, config
      );
      alert("Cuadrilla eliminada");
      setCuadrillaSeleccionada(null);
      cargarCuadrillas();
    } catch (error) {
      alert("Error al eliminar cuadrilla");
      console.error(error);
    }
  };

 return (
    <div className="dashboard-layout">
    <Sidebar colapsado={true} /> 
      <main className="main-content"> 
        <div className={styles["gestion-container"]}>
          <h2>Gestión de Cuadrillas</h2>

          <div className={styles["acciones-superior"]}>
            <input
              type="text"
              placeholder="Buscar cuadrilla..."
              value={busqueda}
              onChange={handleBusquedaChange}
              className={styles["input-buscar"]}
              disabled={mostrarFormulario}
            />

            {!mostrarFormulario ? (
              <button
                className="btn-registrar"
                onClick={() => {
                  setCuadrillaSeleccionada(null);
                  setFormData({
                    no_unidad: "",
                    nombre_cuadrilla: "",
                    zona_de_trabajo: "",
                  });
                  setMostrarFormulario(true);
                }}
              >
                Registrar
              </button>
            ) : (
              <button
                className="btn-cancelar"
                onClick={() => {
                  setCuadrillaSeleccionada(null);
                  setFormData({
                    no_unidad: "",
                    nombre_cuadrilla: "",
                    zona_de_trabajo: "",
                  });
                  setMostrarFormulario(false);
                }}
              >
                Cancelar
              </button>
            )}

            <button
              className="btn-editar"
              onClick={() => {
                if (cuadrillaSeleccionada) seleccionarCuadrilla(cuadrillaSeleccionada);
                else alert("Selecciona una cuadrilla para editar");
              }}
              disabled={mostrarFormulario}
            >
              Editar
            </button>

            <button
              className="btn-eliminar"
              onClick={eliminarCuadrilla}
              disabled={mostrarFormulario}
            >
              Eliminar
            </button>

            <button
              className="btn-regresar"
              onClick={() => navigate("/Dashboard")}
              disabled={mostrarFormulario}
            >
              Regresar
            </button>
          </div>

          {!mostrarFormulario && (
            <div className={styles["tabla-wrapper"]}>
              <table className={styles["tabla-usuarios"]}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>No. Unidad</th>
                    <th>Nombre de Cuadrilla</th>
                    <th>Zona de Trabajo</th>
                  </tr>
                </thead>
                <tbody>
                  {cuadrillasFiltradas.map((c) => (
                    <tr
                      key={c.id_cuadrilla}
                      className={
                        cuadrillaSeleccionada?.id_cuadrilla === c.id_cuadrilla
                          ? styles["seleccionado"]
                          : ""
                      }
                      onClick={() => setCuadrillaSeleccionada(c)}
                      onDoubleClick={() => seleccionarCuadrilla(c)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{c.id_cuadrilla}</td>
                      <td>{c.no_unidad}</td>
                      <td>{c.nombre_cuadrilla}</td>
                      <td>{c.zona_de_trabajo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {mostrarFormulario && (
            <div className={styles["form-container"]}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  cuadrillaSeleccionada ? editarCuadrilla() : registrarCuadrilla();
                }}
                className={styles["form-box"]}
              >
                <h3>{cuadrillaSeleccionada ? "Editar Cuadrilla" : "Registrar Cuadrilla"}</h3>

                <input
                  type="text"
                  name="no_unidad"
                  placeholder="Número de Unidad"
                  value={formData.no_unidad}
                  onChange={(e) => setFormData({ ...formData, no_unidad: e.target.value })}
                  required
                />
                <input
                  type="text"
                  name="nombre_cuadrilla"
                  placeholder="Nombre de Cuadrilla"
                  value={formData.nombre_cuadrilla}
                  onChange={(e) => setFormData({ ...formData, nombre_cuadrilla: e.target.value })}
                  required
                />
                <input
                  type="text"
                  name="zona_de_trabajo"
                  placeholder="Zona de Trabajo"
                  value={formData.zona_de_trabajo}
                  onChange={(e) => setFormData({ ...formData, zona_de_trabajo: e.target.value })}
                  required
                />

                <div className={styles["botones-form"]}>
                  <button type="submit" className={cuadrillaSeleccionada ? "btn-registrar" : "btn-registrar"}>
                    {cuadrillaSeleccionada ? "Guardar cambios" : "Registrar"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setCuadrillaSeleccionada(null);
                      setFormData({
                        no_unidad: "",
                        nombre_cuadrilla: "",
                        zona_de_trabajo: "",
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

export default GestionCuadrillas;
