import React, { useEffect, useState } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import 'chart.js/auto';
import styles from "..//assets/styles/reportes.module.css";
import Sidebar from "../components/Sidebar";
import "../assets/styles/Sidebar.css";

const Dashboard = () => {
  const [incidentesSemana, setIncidentesSemana] = useState([]);
  const [tendenciaMensual, setTendenciaMensual] = useState([]);
  const [totalIncidentes, setTotalIncidentes] = useState(null);
  const [incidentesPorTipo, setIncidentesPorTipo] = useState([]);
  const [incidentesPorCuadrilla, setIncidentesPorCuadrilla] = useState([]);
  const [topTrabajadores, setTopTrabajadores] = useState([]);
  const [diasSinAccidentes, setDiasSinAccidentes] = useState(null);

  // Nuevas métricas
  const [diasSinAccidentesHistorico, setDiasSinAccidentesHistorico] = useState([]);
  const [trabajadorMasIncidentes, setTrabajadorMasIncidentes] = useState(null);
  const [cuadrillaMasIncidentes, setCuadrillaMasIncidentes] = useState(null);

  const [tasaPorCuadrilla, setTasaPorCuadrilla] = useState([]);
  const [frecuenciaTiposMensual, setFrecuenciaTiposMensual] = useState([]);
  const [gravedadPromedioCuadrilla, setGravedadPromedioCuadrilla] = useState([]);
  const [tiempoPromedioRevision, setTiempoPromedioRevision] = useState(null);
  const [incidentesPorZona, setIncidentesPorZona] = useState([]);
  const [usuarioMasReportes, setUsuarioMasReportes] = useState(null);
  const [promedioDiasSinAcc, setPromedioDiasSinAcc] = useState(null);
  const [topCausasIncidentes, setTopCausasIncidentes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [resSemana, resTendencia, resTotal, resTipo, resCuadrilla, resTrabajadores, resDiasSinAcc] = await Promise.all([
          fetch("/apis/incidentes-por-semana"),
          fetch("/apis/tendencia-mensual"),
          fetch("/apis/total-incidentes"),
          fetch("/apis/incidentes-por-tipo"),
          fetch("/apis/incidentes-por-cuadrilla"),
          fetch("/apis/top-trabajadores"),
          fetch("/apis/dias-sin-accidentes"),
        ]);

        const dataSemana = await resSemana.json();
        const dataTendencia = await resTendencia.json();
        const dataTotal = await resTotal.json();
        const dataTipo = await resTipo.json();
        const dataCuadrilla = await resCuadrilla.json();
        const dataTrabajadores = await resTrabajadores.json();
        const dataDiasSinAcc = await resDiasSinAcc.json();

        setIncidentesSemana(dataSemana);
        setTendenciaMensual(dataTendencia);
        setTotalIncidentes(dataTotal.total);
        setIncidentesPorTipo(dataTipo);
        setIncidentesPorCuadrilla(dataCuadrilla);
        setTopTrabajadores(dataTrabajadores);
        setDiasSinAccidentes(dataDiasSinAcc.dias_sin_accidentes);

        // Nuevos endpoints
        const [
          resDiasSinHist, 
          resTrabajadorTop, 
          resCuadrillaTop, 
          resTasaCuadrilla, 
          resFreqTipos, 
          resGravedadProm, 
          resTiempoRev, 
          resIncZona, 
          resUsuarioRep, 
          resPromDiasSin, 
          resTopCausas
        ] = await Promise.all([
          fetch("/apis/dias-sin-accidentes-historico"),
          fetch("/apis/trabajador-mas-incidentes"),
          fetch("/apis/cuadrilla-mas-incidentes"),
          fetch("/apis/tasa-incidentes-por-cuadrilla"),
          fetch("/apis/frecuencia-tipos-mensual"),
          fetch("/apis/gravedad-promedio-cuadrilla"),
          fetch("/apis/tiempo-promedio-revision"),
          fetch("/apis/incidentes-por-zona"),
          fetch("/apis/usuario-mas-reportes"),
          fetch("/apis/promedio-dias-sin-accidentes"),
          fetch("/apis/top-causas-incidentes"),
        ]);

        const dataDiasSinHist = await resDiasSinHist.json();
        const dataTrabajadorTop2 = await resTrabajadorTop.json();
        const dataCuadrillaTop2 = await resCuadrillaTop.json();
        const dataTasaCuadrilla = await resTasaCuadrilla.json();
        const dataFreqTipos = await resFreqTipos.json();
        const dataGravedadProm = await resGravedadProm.json();
        const dataTiempoRev = await resTiempoRev.json();
        const dataIncZona = await resIncZona.json();
        const dataUsuarioRep = await resUsuarioRep.json();
        const dataPromDias = await resPromDiasSin.json();
        const dataTopCausas = await resTopCausas.json();

        setDiasSinAccidentesHistorico(dataDiasSinHist);
        setTrabajadorMasIncidentes(dataTrabajadorTop2);
        setCuadrillaMasIncidentes(dataCuadrillaTop2);
        setTasaPorCuadrilla(dataTasaCuadrilla);
        setFrecuenciaTiposMensual(dataFreqTipos);
        setGravedadPromedioCuadrilla(dataGravedadProm);
        setTiempoPromedioRevision(dataTiempoRev.promedio_dias_revision ?? dataTiempoRev.promedio_dias_revision); 
        setIncidentesPorZona(dataIncZona);
        setUsuarioMasReportes(dataUsuarioRep);
        setPromedioDiasSinAcc(dataPromDias.promedio_dias);
        setTopCausasIncidentes(dataTopCausas);

        setLoading(false);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudieron cargar las estadísticas.");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Cargando estadísticas...</p>;
  if (error) return <p style={{ color: "red", fontWeight: "bold", padding: "20px" }}>Error: {error}</p>;

  // --- Preparar los datasets de los nuevos gráficos ---

  // Tasa de incidentes por cuadrilla (barra)
  const dataTasaCuadrilla = {
    labels: tasaPorCuadrilla.map(e => e.nombre_cuadrilla),
    datasets: [
      {
        label: "Tasa de Incidentes por Trabajador",
        data: tasaPorCuadrilla.map(e => e.tasa_incidentes),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  // Frecuencia de tipos mensual (stacked o múltiples barras)
  const mesesTipos = frecuenciaTiposMensual.map(e => `Mes ${e.mes} - ${e.anio}`);
  const tiposUnicos = Array.from(new Set(frecuenciaTiposMensual.map(e => e.tipo_incidente)));
  // construir dataset por tipo
  const datasetFreqTipos = tiposUnicos.map(tipo => {
    return {
      label: tipo,
      data: frecuenciaTiposMensual.map(e => e.tipo_incidente === tipo ? e.total : 0),
      backgroundColor: '#' + ((Math.random() * 0xFFFFFF) << 0).toString(16).padStart(6, '0'),
    };
  });
  const dataFreqTiposChart = {
    labels: mesesTipos,
    datasets: datasetFreqTipos
  };

  // Gravedad promedio por cuadrilla (barra)
  const dataGravedadProm = {
    labels: gravedadPromedioCuadrilla.map(e => e.nombre_cuadrilla),
    datasets: [
      {
        label: "Gravedad Promedio (escala 1 a 3)",
        data: gravedadPromedioCuadrilla.map(e => e.gravedad_promedio),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }
    ]
  };

  // Tiempo promedio de revisión (línea / barra simple)
  const dataTiempoRevision = {
    labels: ["Tiempo Promedio de Revisión (días)"],
    datasets: [
      {
        label: "Días",
        data: [tiempoPromedioRevision],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Incidentes por zona (barra)
  const dataIncZona = {
    labels: incidentesPorZona.map(e => e.zona_de_trabajo),
    datasets: [
      {
        label: "Incidentes por Zona",
        data: incidentesPorZona.map(e => e.total_incidentes),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  // Usuario con más reportes (barra única)
  const dataUsuarioRep = {
    labels: usuarioMasReportes ? [`${usuarioMasReportes.nombres} ${usuarioMasReportes.apellidos}`] : ["Sin datos"],
    datasets: [
      {
        label: "Total de reportes",
        data: usuarioMasReportes ? [usuarioMasReportes.total_reportes] : [0],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  // Top causas incidentes (barra / pie)
  const dataTopCausas = {
    labels: topCausasIncidentes.map(e => e.tipo_incidente),
    datasets: [
      {
        label: "Top causas de incidentes",
        data: topCausasIncidentes.map(e => e.total),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#66BB6A", "#BA68C8"
        ],
        borderColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#66BB6A", "#BA68C8"
        ],
        borderWidth: 1
      }
    ]
  };

  // Días sin accidentes histórico (línea) → ya lo tienes
  const dataDiasSinHist = {
    labels: diasSinAccidentesHistorico.length > 0
      ? diasSinAccidentesHistorico.map(i => i.fecha)
      : ["Sin datos"],
    datasets: [
      {
        label: "Días sin accidentes",
        data: diasSinAccidentesHistorico.length > 0
          ? diasSinAccidentesHistorico.map(i => i.dias_sin_accidentes)
          : [0],
        fill: false,
        backgroundColor: "rgba(75,192,192,0.5)",
        borderColor: "rgba(75,192,192,1)"
      }
    ]
  };

  return (
    <div className="dashboard-layout">
      <Sidebar colapsado={true} />
      <main className="main-content">
        <div className={styles.container}>
          <h1 className={styles.title}>Dashboard de incidentes</h1>

          {/* Resumen principal */}
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <h2>Total de incidentes</h2>
              <p>{totalIncidentes !== null ? totalIncidentes : "No hay datos disponibles"}</p>
            </div>
            <div className={styles.summaryItem}>
              <h2>Días sin accidentes</h2>
              <p>{diasSinAccidentes !== null ? diasSinAccidentes : "No hay datos disponibles"}</p>
            </div>
            <div className={styles.summaryItem}>
              <h2>Trabajador con más incidentes</h2>
              <p>
                {trabajadorMasIncidentes && trabajadorMasIncidentes.total > 0
                  ? `${trabajadorMasIncidentes.nombres} ${trabajadorMasIncidentes.apellidos} (${trabajadorMasIncidentes.total} incidentes)`
                  : "No hay datos disponibles"}
              </p>
            </div>
            <div className={styles.summaryItem}>
              <h2>Cuadrilla con más incidentes</h2>
              <p>
                {cuadrillaMasIncidentes && cuadrillaMasIncidentes.total > 0
                  ? `${cuadrillaMasIncidentes.nombre_cuadrilla} (${cuadrillaMasIncidentes.total} incidentes)`
                  : "No hay datos disponibles"}
              </p>
            </div>
            <div className={styles.summaryItem}>
              <h2>Promedio días entre accidentes</h2>
              <p>{promedioDiasSinAcc !== null ? promedioDiasSinAcc : "No hay datos"}</p>
            </div>
          </div>

          {/* Gráficos existentes */}
          <section className={styles.section}>
            <h3>Incidentes por semana</h3>
            {incidentesSemana.length > 0 ? <Line data={{
              labels: incidentesSemana.map(i => `Año ${i.anio} - Semana ${i.semana}`),
              datasets: [
                {
                  label: "Incidentes por Semana",
                  data: incidentesSemana.map(i => i.total_incidentes),
                  backgroundColor: "rgba(255,99,132,0.5)",
                  borderColor: "rgba(255,99,132,1)",
                  fill: false
                }
              ]
            }} /> : <p>No hay datos disponibles para incidentes por semana.</p>}
          </section>

          <section className={styles.section}>
            <h3>Tendencia mensual de incidentes</h3>
            {tendenciaMensual.length > 0 ? <Bar data={{
              labels: tendenciaMensual.map(i => `Mes ${i.mes} - Año ${i.anio}`),
              datasets: [
                {
                  label: "Incidentes por Mes",
                  data: tendenciaMensual.map(i => i.total),
                  backgroundColor: "rgba(54,162,235,0.5)",
                  borderColor: "rgba(54,162,235,1)",
                  borderWidth: 1
                }
              ]
            }} /> : <p>No hay datos disponibles para tendencia mensual.</p>}
          </section>

          {/* NUEVOS GRÁFICOS */}

          <section className={styles.section}>
            <h3>Tasa de incidentes por cuadrilla</h3>
            {tasaPorCuadrilla.length > 0 ? <Bar data={dataTasaCuadrilla} /> : <p>No hay datos para tasa por cuadrilla.</p>}
          </section>

          <section className={styles.section}>
            <h3>Frecuencia tipos de incidentes (Mensual)</h3>
            {frecuenciaTiposMensual.length > 0 ? <Bar data={dataFreqTiposChart} /> : <p>No hay datos para frecuencia tipos mensual.</p>}
          </section>

          <section className={styles.section}>
            <h3>Gravedad promedio por cuadrilla</h3>
            {gravedadPromedioCuadrilla.length > 0 ? <Bar data={dataGravedadProm} /> : <p>No hay datos para gravedad promedio por cuadrilla.</p>}
          </section>

          <section className={styles.section}>
            <h3>Tiempo promedio de revisión (Días)</h3>
            {tiempoPromedioRevision !== null ? <Bar data={dataTiempoRevision} /> : <p>No hay datos para tiempo de revisión.</p>}
          </section>

          <section className={styles.section}>
            <h3>Incidentes por zona de trabajo</h3>
            {incidentesPorZona.length > 0 ? <Bar data={dataIncZona} /> : <p>No hay datos para incidentes por zona.</p>}
          </section>

          <section className={styles.section}>
            <h3>Usuario con más reportes</h3>
            {usuarioMasReportes ? <Bar data={dataUsuarioRep} /> : <p>No hay datos para usuario con más reportes.</p>}
          </section>

          <section className={styles.section}>
            <h3>Top causas de incidentes</h3>
            {topCausasIncidentes.length > 0 ? <Bar data={dataTopCausas} /> : <p>No hay datos para top causas.</p>}
          </section>

          <section className={styles.section}>
            <h3>Días sin accidentes histórico</h3>
            {diasSinAccidentesHistorico.length > 0 ? <Line data={dataDiasSinHist} /> : <p>No hay datos disponibles para días sin accidentes histórico.</p>}
          </section>

          <section className={styles.section}>
            <h3>Top 10 trabajadores con más incidentes</h3>
            {topTrabajadores.length > 0 ? (
              <ol className={styles.topList}>
                {topTrabajadores.slice(0, 10).map((trabajador, idx) => (
                  <li key={idx}>
                    {trabajador.nombres} {trabajador.apellidos} — {trabajador.total} incidentes
                  </li>
                ))}
              </ol>
            ) : (
              <p>No hay datos disponibles para los trabajadores.</p>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
