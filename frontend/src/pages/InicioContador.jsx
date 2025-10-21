import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../assets/styles/InicioContador.module.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../assets/styles/Sidebar.css";

  const token = localStorage.getItem('token');
  const config = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

const InicioContador = () => {
  const [contador, setContador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iniciando, setIniciando] = useState(false);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [confirmarReinicio, setConfirmarReinicio] = useState(false);

  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
  const id_usuario = usuarioLogueado?.id_usuario;

  const navigate = useNavigate();

  useEffect(() => {
    obtenerContador();
  }, []);

  const obtenerContador = async () => {
    try {
      const res = await axios.get("/api/contador/actual", config);
      setContador(res.data);
    } catch (error) {
      console.error("Error al obtener el contador:", error);
    } finally {
      setLoading(false);
    }
  };

  const regresarAlPanel = () => {
    navigate("/Dashboard");
  };

  const iniciarContador = async () => {
    if (!id_usuario) {
      alert("Usuario no identificado.");
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);

    try {
      setIniciando(true);
      await axios.post("/api/contador/iniciar", {
        fecha_de_inicio: hoy,
      }, config);
      alert("Contador iniciado correctamente.");
      setMostrandoFormulario(false);
      obtenerContador();
    } catch (error) {
      console.error("Error al iniciar contador:", error);
      alert(error.response?.data?.message || "Error al iniciar el contador.");
    } finally {
      setIniciando(false);
    }
  };

  const reiniciarForzoso = async () => {
    if (!id_usuario) {
      alert("Usuario no identificado.");
      return;
    }

    try {
      setIniciando(true);
      await axios.post("/api/contador/reiniciar-forzoso", {}, config);
      alert("Contador reiniciado forzosamente.");
      setConfirmarReinicio(false);
      obtenerContador();
    } catch (error) {
      console.error("Error al reiniciar forzosamente:", error);
      alert("Error al reiniciar forzosamente el contador.");
    } finally {
      setIniciando(false);
    }
  };

  const calcularDiasDesde = (fechaInicio) => {
    const inicio = new Date(fechaInicio);
    const inicioUTC = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), inicio.getUTCDate()));
    const hoy = new Date();
    const hoyUTC = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
    const diferencia = hoyUTC - inicioUTC;
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="dashboard-layout">
    <Sidebar colapsado={true} /> 
    <main className="main-content"> 
      <div className={styles.contadorContainer}>
        <h2>Contador de Días Sin Accidentes</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : contador?.fecha_de_inicio ? (
          <div className={styles.cardContador}>
            <p><strong>Fecha de inicio:</strong> {new Date(contador.fecha_de_inicio).toLocaleDateString()}</p>
            <p><strong>Días sin accidentes:</strong> {contador.fecha_fin ? contador.dias_totales : calcularDiasDesde(contador.fecha_de_inicio)}</p>
            {contador.fecha_fin && (
              <p><strong>Fecha del último incidente:</strong> {new Date(contador.fecha_fin).toLocaleDateString()}</p>
            )}
            {contador.id_incidente && (
              <p><strong>ID Incidente que reinició:</strong> {contador.id_incidente}</p>
            )}

            <div className={styles.botonesContador}>
              <button
                onClick={regresarAlPanel}
                className={`${styles.btnRegresarIn} btn-regresar`}
              >
                Regresar
              </button>

              {!confirmarReinicio ? (
                <button
                  onClick={() => setConfirmarReinicio(true)}
                  className="btn-reiniciar"
                >
                  Reiniciar Forzosamente
                </button>
              ) : (
                <div className={styles.confirmacionReinicio}>
                  <p>¿Seguro que deseas reiniciar forzosamente?</p>
                  <button
                    onClick={reiniciarForzoso}
                    disabled={iniciando}
                    className="btn-reiniciar"
                  >
                    {iniciando ? "Reiniciando..." : "Sí, Reiniciar"}
                  </button>
                  <button
                    onClick={() => setConfirmarReinicio(false)}
                    className={`${styles.btnCancelarIn} btn-cancelar`}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p>No hay contador activo actualmente.</p>

            {!mostrandoFormulario ? (
              <>
                <button
                  onClick={() => setMostrandoFormulario(true)}
                  disabled={iniciando}
                  className="btn-registrar"
                >
                  Iniciar Contador
                </button>
                <button
                  onClick={regresarAlPanel}
                  className={`${styles.btnRegresarIn} btn-regresar`}
                >
                  Regresar
                </button>
              </>
            ) : (
              <div className={styles.formularioConfirmacion}>
                <p>¿Estás seguro que deseas iniciar el contador hoy?</p>
                <button
                  onClick={iniciarContador}
                  disabled={iniciando}
                  className="btn-registrar"
                >
                  {iniciando ? "Iniciando..." : "Confirmar"}
                </button>
                <button
                  onClick={() => setMostrandoFormulario(false)}
                  className={`${styles.btnCancelarIn} btn-cancelar`}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  </div>
  );
};

export default InicioContador;
