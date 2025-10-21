import React, { useEffect, useState } from 'react';
import styles from "../assets/styles/Bitacora.module.css";
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import "../assets/styles/Sidebar.css";

function Bitacora() {
  const [bitacora, setBitacora] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
      fetch('/api/bitacora', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Error ${res.status}: ${errorText}`);
          }
          return res.json();
        })
        .then(data => {
          setBitacora(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error al cargar la bitácora:', err.message);
          setLoading(false);
        });
  }, []);

  const handleRegresar = () => {
    navigate('/panel');
  };

  if (loading) return <p>Cargando bitácora...</p>;

  return (
    <div className="dashboard-layout">
    <Sidebar colapsado={true} />
    <main className="main-content">
      <div className={styles.gestionContainer}>
        <h2 className={styles.titulo}>Bitácora de Actividades</h2>

          <button
            onClick={() => navigate("/Dashboard")}
            className="btn-regresar"
          >
            Regresar
          </button>

        <div className={styles.tablaWrapper}>
          <table className={styles.tablaBitacora}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Realizado por:</th>
                <th>Acción</th>
                <th>Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {bitacora.map((entry) => (
                <tr key={entry.id_bitacora}>
                  <td>{entry.id_bitacora}</td>
                  <td>{entry.nombre_completo || 'Sistema'}</td>
                  <td>{entry.accion}</td>
                  <td>{new Date(entry.fecha_hora).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
  );
}

export default Bitacora;
