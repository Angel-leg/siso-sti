import React, { useState, useEffect } from "react";
import axios from "axios";
import "../assets/styles/9mensaje.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../assets/styles/Sidebar.css";

  const token = localStorage.getItem('token');
  const config = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

const Mensaje = () => {
  const navigate = useNavigate();

  // Obtener datos del usuario desde localStorage
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")) || null;
  const usuarioId = usuarioLogueado?.id_usuario;

  const [mensajes, setMensajes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    mensaje: "",
    fecha_publicacion: "",
    fecha_expiracion: "",
    visible: true,
  });

  // Cargar mensajes
  const cargarMensajes = async () => {
    try {
      const res = await axios.get("/api/mensajes", config);
      setMensajes(res.data);
    } catch (error) {
      console.error("Error al cargar mensajes", error);
    }
  };

  useEffect(() => {
    cargarMensajes();
  }, []);

  const handleBusquedaChange = (e) => setBusqueda(e.target.value);

  const mensajesFiltrados = mensajes.filter((m) =>
    `${m.id_anuncio} ${m.titulo} ${m.mensaje} ${m.nombres} ${m.apellidos}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const seleccionarMensaje = (mensaje) => {
    console.log("Mensaje seleccionado:", mensaje);
    console.log("Fecha publicación raw:", mensaje.fecha_publicacion);
    console.log("Fecha expiración raw:", mensaje.fecha_expiracion);

    setMensajeSeleccionado(mensaje);
    setFormData({
      titulo: mensaje.titulo,
      mensaje: mensaje.mensaje,
      fecha_publicacion: mensaje.fecha_publicacion ? new Date(mensaje.fecha_publicacion).toISOString().slice(0, 10) : "",
      fecha_expiracion: mensaje.fecha_expiracion ? new Date(mensaje.fecha_expiracion).toISOString().slice(0, 10) : "",
      visible: Boolean(mensaje.visible),
    });
    setMostrarFormulario(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const registrarMensaje = async () => {
    if (!usuarioId) {
      alert("No se encontró el ID del usuario. No se puede registrar el mensaje.");
      return;
    }

    try {
      await axios.post("/api/mensajes", {
        ...formData,
        creado_por: usuarioId,
      }, config);
      alert("Mensaje registrado");
      setMostrarFormulario(false);
      cargarMensajes();
      setFormData({
        titulo: "",
        mensaje: "",
        fecha_publicacion: "",
        fecha_expiracion: "",
        visible: true,
      });
    } catch (error) {
      alert("Error al registrar mensaje");
      console.error(error);
    }
  };

  const editarMensaje = async () => {
    try {
      await axios.put(
        `/api/mensajes/${mensajeSeleccionado.id_anuncio}`,
        formData,
        config
      );
      alert("Mensaje actualizado");
      setMostrarFormulario(false);
      setMensajeSeleccionado(null);
      cargarMensajes();
      setFormData({
        titulo: "",
        mensaje: "",
        fecha_publicacion: "",
        fecha_expiracion: "",
        visible: true,
      });
    } catch (error) {
      alert("Error al actualizar mensaje");
      console.error(error);
    }
  };

  const eliminarMensaje = async () => {
    if (!mensajeSeleccionado) {
      alert("Selecciona un mensaje para eliminar");
      return;
    }
    if (!window.confirm("¿Seguro quieres eliminar este mensaje?")) return;

    try {
      await axios.delete(
        `/api/mensajes/${mensajeSeleccionado.id_anuncio}`,
        config
      );
      alert("Mensaje eliminado");
      setMensajeSeleccionado(null);
      cargarMensajes();
    } catch (error) {
      alert("Error al eliminar mensaje");
      console.error(error);
    }
  };

  const toggleVisible = async (mensaje) => {
    try {
      await axios.put(
        `/api/mensajes/${mensaje.id_anuncio}`,
        {
          ...mensaje,
          visible: !mensaje.visible,
        },
        config
      );
      cargarMensajes();
    } catch (error) {
      console.error("Error al actualizar visibilidad", error);
    }
  };

  return (
    <div className="dashboard-layout">
    <Sidebar colapsado={true} /> 
    <main className="main-content">
        <div className="mensaje-container">
          <h2>Mensajes del Día</h2>

          <div className="acciones-superior">
            <input
              type="text"
              placeholder="Buscar mensaje..."
              value={busqueda}
              onChange={handleBusquedaChange}
              className="input-buscar"
              disabled={mostrarFormulario}
            />

            {!mostrarFormulario ? (
              <button
                onClick={() => {
                  setMensajeSeleccionado(null);
                  setFormData({
                    titulo: "",
                    mensaje: "",
                    fecha_publicacion: "",
                    fecha_expiracion: "",
                    visible: true,
                  });
                  setMostrarFormulario(true);
                }}
                className="btn-registrar"
              >
                Mensaje nuevo
              </button>
            ) : (
              <button
                onClick={() => {
                  setMensajeSeleccionado(null);
                  setFormData({
                    titulo: "",
                    mensaje: "",
                    fecha_publicacion: "",
                    fecha_expiracion: "",
                    visible: true,
                  });
                  setMostrarFormulario(false);
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
            )}

            <button
              onClick={() => {
                if (mensajeSeleccionado) seleccionarMensaje(mensajeSeleccionado);
                else alert("Selecciona un mensaje para editar");
              }}
              className="btn-editar"
              disabled={mostrarFormulario}
            >
              Editar
            </button>

            <button
              onClick={eliminarMensaje}
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
            <div className="tabla-wrapper">
            <table className="tabla-mensajes">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Mensaje</th>
                  <th>Publicado por</th>
                  <th>Fecha publicación</th>
                  <th>Fecha expiración</th>
                  <th>Visible</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {mensajesFiltrados.map((m) => (
                  <tr
                    key={m.id_anuncio}
                    className={mensajeSeleccionado?.id_anuncio === m.id_anuncio ? "seleccionado" : ""}
                    onClick={() => setMensajeSeleccionado(m)}
                    onDoubleClick={() => seleccionarMensaje(m)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{m.id_anuncio}</td>
                    <td>{m.titulo}</td>
                    <td>{m.mensaje}</td>
                    <td>
                      {m.nombres} {m.apellidos}
                    </td>
                    <td>
                    {m.fecha_publicacion ? new Date(m.fecha_publicacion).toISOString().slice(0, 10) : "-"}
                    </td>
                    <td>
                      {m.fecha_expiracion ? new Date(m.fecha_expiracion).toISOString().slice(0, 10) : "-"}
                    </td>
                    <td>{m.visible ? "Sí" : "No"}</td>
                    <td>
                      <button className="btn-toggle" onClick={() => toggleVisible(m)}>
                        {m.visible ? "Ocultar" : "Mostrar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}

          {mostrarFormulario && (
            <div className="form-container">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  mensajeSeleccionado ? editarMensaje() : registrarMensaje();
                }}
                className="form-box"
              >
                <h3>{mensajeSeleccionado ? "Editar Mensaje" : "Registrar Mensaje"}</h3>

                <input
                  type="text"
                  name="titulo"
                  placeholder="Título"
                  value={formData.titulo}
                  onChange={handleFormChange}
                  required
                />
                <textarea
                  name="mensaje"
                  placeholder="Mensaje"
                  value={formData.mensaje}
                  onChange={handleFormChange}
                  required
                />
                <input
                  type="date"
                  name="fecha_publicacion"
                  value={formData.fecha_publicacion}
                  onChange={handleFormChange}
                  required
                />
                <input
                  type="date"
                  name="fecha_expiracion"
                  value={formData.fecha_expiracion}
                  onChange={handleFormChange}
                />
                <label>
                  <input
                    type="checkbox"
                    name="visible"
                    checked={formData.visible}
                    onChange={handleFormChange}
                  />
                  Visible
                </label>

                <div className="botones-form">
                  <button type="submit">
                    {mensajeSeleccionado ? "Guardar cambios" : "Registrar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setMensajeSeleccionado(null);
                      setFormData({
                        titulo: "",
                        mensaje: "",
                        fecha_publicacion: "",
                        fecha_expiracion: "",
                        visible: true,
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

export default Mensaje;
