import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/styles/6contador.css";

const token = localStorage.getItem('token');
const config = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

const Contador = () => {
  const [dias, setDias] = useState(0);
  const [mensajes, setMensajes] = useState([]);
  const [mensajeIndex, setMensajeIndex] = useState(0);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const contadorRef = useRef(null);
  const mensajeRef = useRef(null);
  const navigate = useNavigate();

  const cargarDiasSinAccidentes = async () => {
    try {
      const res = await axios.get("/api/contador/actual", config);
      const contador = res.data;

      if (contador && contador.fecha_de_inicio && !contador.fecha_fin) {
        const inicio = new Date(contador.fecha_de_inicio);
        const hoy = new Date();
        const diferenciaEnMs = hoy - inicio;
        const diasCalculados = Math.floor(diferenciaEnMs / (1000 * 60 * 60 * 24));
        setDias(diasCalculados);
      } else {
        setDias(0);
      }
    } catch (error) {
      console.error("Error al cargar días sin accidentes:", error);
      setDias(0);
    }
  };

  // Cargar días sin accidentes al montar
  useEffect(() => {
    cargarDiasSinAccidentes();
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      cargarDiasSinAccidentes();
    }, 60000); //Se actualiza cada 60 segundos

    return () => clearInterval(intervalo);
  }, []);

  // Cargar mensajes visibles
  useEffect(() => {
    const cargarMensajes = async () => {
      try {
        const res = await axios.get("/api/mensajes", config);
        const visibles = res.data.filter((m) => m.visible === 1);
        setMensajes(visibles);
        if (visibles.length > 0) {
          setMensajeIndex(0);
          setMostrarMensaje(true);
        }
      } catch (err) {
        console.error("Error al cargar mensajes:", err);
      }
    };
    cargarMensajes();
  }, []);

  useEffect(() => {
    if (!mensajes.length) return;
    setMostrarMensaje(true);
  }, [mensajeIndex, mensajes]);

  // Mensajes animados
  useEffect(() => {
    const span = mensajeRef.current;
    if (!span) return;

    const handleAniEnd = () => {
      setMostrarMensaje(false);
      setTimeout(() => {
        setMensajeIndex((prev) => (prev + 1) % mensajes.length);
        setMostrarMensaje(true);
      }, 50);
    };

    span.addEventListener("animationend", handleAniEnd);
    return () => span.removeEventListener("animationend", handleAniEnd);
  }, [mensajeIndex, mensajes]);

  // Detectar fullscreen
  useEffect(() => {
    const onFsChange = () => {
      const fsEl =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fsEl);
    };

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("msfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("msfullscreenchange", onFsChange);
    };
  }, []);

  // Salir de fullscreen con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        (document.exitFullscreen ??
          document.webkitExitFullscreen ??
          document.msExitFullscreen)?.();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  const handleFullscreenToggle = async () => {
    const el = contadorRef.current;
    if (!el) return;

    try {
      if (!isFullscreen) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else {
          console.warn("Fullscreen API no compatible");
        }
      }
    } catch (err) {
      console.error("Error al entrar a fullscreen:", err);
    }
  };

  const handleRegresar = () => {
    const fsEl =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;

    if (fsEl) {
      const onceFsExit = () => {
        const stillFs =
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement;

        if (!stillFs) {
          cleanup();
          navigate("/Dashboard");
        }
      };

      const cleanup = () => {
        document.removeEventListener("fullscreenchange", onceFsExit);
        document.removeEventListener("webkitfullscreenchange", onceFsExit);
        document.removeEventListener("msfullscreenchange", onceFsExit);
      };

      document.addEventListener("fullscreenchange", onceFsExit);
      document.addEventListener("webkitfullscreenchange", onceFsExit);
      document.addEventListener("msfullscreenchange", onceFsExit);

      (document.exitFullscreen ??
        document.webkitExitFullscreen ??
        document.msExitFullscreen)?.();
    } else {
      navigate("/Dashboard");
    }
  };

  return (
    <div ref={contadorRef} className="contador-container">
      <h1>Días sin accidentes: {dias}</h1>

      <div className="mensaje-ticker">
        {mostrarMensaje && mensajes.length > 0 && (
          <span key={mensajeIndex} ref={mensajeRef}>
            {mensajes[mensajeIndex].mensaje}
          </span>
        )}
      </div>

      {!isFullscreen && (
        <div className="botones-container">
          <button
            onClick={handleFullscreenToggle}
            type="button"
            className="btn-fullscreen"
          >
            Fullscreen
          </button>
          <button
            onClick={handleRegresar}
            type="button"
            className="btn-regresar"
          >
            Regresar
          </button>
        </div>
      )}
    </div>
  );
};

export default Contador;
