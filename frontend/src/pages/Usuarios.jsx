import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import styles from "../assets/styles/2GestionUsuarios.module.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../assets/styles/Sidebar.css";

//Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: "/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const GestionUsuarios = () => {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    usuario: "",
    contrasena: "",
    id_rol: "",
    estado: "1",
  });

  const [roles, setRoles] = useState([]);

  // Se cargan los roles desde backend
  const cargarRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/usuarios/roles");
      setRoles(res.data);
    } catch (error) {
      alert(
        error.response?.data?.message || "Error al cargar roles"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //Cargar usuarios desde backend
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch (error) {
      alert(
        error.response?.data?.message || "Error al cargar usuarios"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  // Manejar cambio en búsqueda
  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  // Optimizar filtro con useMemo
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) =>
      `${u.id_usuario} ${u.nombres} ${u.apellidos} ${u.usuario} ${u.correo} ${u.nombre_rol}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [usuarios, busqueda]);

  // Seleccionar usuario para editar
  const seleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      usuario: usuario.usuario,
      contrasena: "",
      id_rol: usuario.id_rol.toString(),
      estado: usuario.estado === 1 ? "1" : "0",
    });
    setMostrarFormulario(true);
  };

  // Manejar cambios en formulario
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Validación simple del formulario
  const validarFormulario = () => {
    if (!formData.nombres.trim()) {
      alert("El campo 'Nombres' es obligatorio");
      return false;
    }
    if (!formData.apellidos.trim()) {
      alert("El campo 'Apellidos' es obligatorio");
      return false;
    }
    if (!formData.correo.trim() || !formData.correo.includes("@")) {
      alert("Ingresa un correo válido");
      return false;
    }
    if (!formData.usuario.trim()) {
      alert("El campo 'Usuario' es obligatorio");
      return false;
    }
    if (!usuarioSeleccionado && formData.contrasena.trim().length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (!formData.id_rol) {
      alert("Selecciona un rol");
      return false;
    }
    return true;
  };

  // Registrar nuevo usuario
  const registrarUsuario = async () => {
    if (!validarFormulario()) return;
    try {
      setLoading(true);
      const payload = { ...formData };
      await api.post("/usuarios", payload);
      alert("Usuario registrado");
      setMostrarFormulario(false);
      cargarUsuarios();
      limpiarFormulario();
    } catch (error) {
      alert(
        error.response?.data?.message || "Error al registrar usuario"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Editar usuario existente
  const editarUsuario = async () => {
    if (!validarFormulario()) return;
    try {
      setLoading(true);
      const payload = { ...formData };
      await api.put(`/usuarios/${usuarioSeleccionado.id_usuario}`, payload);
      alert("Usuario actualizado");
      setMostrarFormulario(false);
      setUsuarioSeleccionado(null);
      cargarUsuarios();
      limpiarFormulario();
    } catch (error) {
      alert(
        error.response?.data?.message || "Error al actualizar usuario"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async () => {
    if (!usuarioSeleccionado) {
      alert("Selecciona un usuario para eliminar");
      return;
    }
    if (!window.confirm("¿Seguro quieres eliminar este usuario?")) return;

    try {
      setLoading(true);
      await api.delete(`/usuarios/${usuarioSeleccionado.id_usuario}`);
      alert("Usuario eliminado");
      setUsuarioSeleccionado(null);
      cargarUsuarios();
    } catch (error) {
      alert(
        error.response?.data?.message || "Error al eliminar usuario"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      correo: "",
      usuario: "",
      contrasena: "",
      id_rol: "",
      estado: "1",
    });
  };

  return (
    <div className="dashboard-layout">
    <Sidebar colapsado={true} /> 
    <main className="main-content"> 
      <div className={styles["gestion-container"]}>
        <h2>Gestión de Usuarios</h2>

        <div className={styles["acciones-superior"]}>
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className={styles["input-buscar"]}
            disabled={mostrarFormulario}
          />

          {!mostrarFormulario ? (
            <button
              onClick={() => {
                setMostrarFormulario(true);
                setUsuarioSeleccionado(null);
                setFormData({
                  nombres: "",
                  apellidos: "",
                  correo: "",
                  usuario: "",
                  contrasena: "",
                  id_rol: "",
                  estado: "1",
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
                setUsuarioSeleccionado(null);
                setFormData({
                  nombres: "",
                  apellidos: "",
                  correo: "",
                  usuario: "",
                  contrasena: "",
                  id_rol: "",
                  estado: "1",
                });
              }}
              className="btn-cancelar"
            >
              Cancelar
            </button>
          )}

          <button
            onClick={() => {
              if (usuarioSeleccionado) seleccionarUsuario(usuarioSeleccionado);
              else alert("Selecciona un usuario para editar");
            }}
            className="btn-editar"
            disabled={mostrarFormulario}
          >
            Editar
          </button>

          <button
            onClick={eliminarUsuario}
            className="btn-eliminar"
            disabled={mostrarFormulario}
          >
            Eliminar
          </button>

          <button
            onClick={() => navigate("/Dashboard")}
            className="btn-regresar"
          >
            Regresar
          </button>
        </div>

        {!mostrarFormulario ? (
          <div className={styles["tabla-wrapper"]}>
            <table className={styles["tabla-usuarios"]}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Correo</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr
                    key={u.id_usuario}
                    className={
                      usuarioSeleccionado?.id_usuario === u.id_usuario
                        ? styles["seleccionado"]
                        : ""
                    }
                    onClick={() => setUsuarioSeleccionado(u)}
                    onDoubleClick={() => seleccionarUsuario(u)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{u.id_usuario}</td>
                    <td>{u.nombres}</td>
                    <td>{u.apellidos}</td>
                    <td>{u.correo}</td>
                    <td>{u.usuario}</td>
                    <td>{u.nombre_rol || "Sin rol"}</td>
                    <td>{u.estado === 1 ? "Activo" : "Inactivo"}</td>
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
                usuarioSeleccionado ? editarUsuario() : registrarUsuario();
              }}
              className={styles["form-box"]}
            >
              <h3>
                {usuarioSeleccionado ? "Editar Usuario" : "Registrar Usuario"}
              </h3>

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
                type="email"
                name="correo"
                placeholder="Correo"
                value={formData.correo}
                onChange={handleFormChange}
                required
              />
              <input
                type="text"
                name="usuario"
                placeholder="Usuario"
                value={formData.usuario}
                onChange={handleFormChange}
                required
              />
              <input
                type="password"
                name="contrasena"
                placeholder="Contraseña"
                value={formData.contrasena}
                onChange={handleFormChange}
                required={!usuarioSeleccionado}
              />

              <select
                name="id_rol"
                value={formData.id_rol}
                onChange={handleFormChange}
                required
              >
                <option value="">Seleccione un rol</option>
                {roles.map((rol) => (
                  <option key={rol.id_rol} value={rol.id_rol}>
                    {rol.nombre_rol}
                  </option>
                ))}
              </select>

              <select
                name="estado"
                value={formData.estado}
                onChange={handleFormChange}
                required
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>

              <div className={styles["botones-form"]}>
                <button type="submit">Guardar</button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setUsuarioSeleccionado(null);
                    setFormData({
                      nombres: "",
                      apellidos: "",
                      correo: "",
                      usuario: "",
                      contrasena: "",
                      id_rol: "",
                      estado: "1",
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

export default GestionUsuarios;
