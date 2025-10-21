import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login'; //si
import Dashboard from './pages/Dashboard'; //si
import Usuarios from './pages/Usuarios'; //si
import Trabajadores from './pages/Trabajadores';  //si
import Cuadrillas from "./pages/Cuadrillas"; //si
import Incidentes from './pages/RegistroIncidentes'; //si
import Clasificacionreportes from "./pages/Clasificacionreportes"; //si
import Reportes from './pages/Reportes'; //si
import Contador from "./pages/Contador"; //si
import Alertas from "./pages/Alertas"; //si
import Bitacora from "./pages/Bitacora"; //si
import Mensaje from "./pages/Mensaje"; //si
import InicioContador from "./pages/InicioContador"; //si
import Configuracion from './pages/Configuracion';
import Panel from "./pages/Panel";

import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Ruta para acceso denegado */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Rutas protegidas con PrivateRoute */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute moduleName="dashboard">
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute moduleName="usuarios">
              <Usuarios />
            </PrivateRoute>
          }
        />

        <Route
          path="/trabajadores"
          element={
            <PrivateRoute moduleName="trabajadores">
              <Trabajadores />
            </PrivateRoute>
          }
        />

        <Route
          path="/registro-incidentes"
          element={
            <PrivateRoute moduleName="registro-incidentes">
              <Incidentes />
            </PrivateRoute>
          }
        />

        <Route
          path="/reportes"
          element={
            <PrivateRoute moduleName="reportes">
              <Reportes />
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracion"
          element={
            <PrivateRoute moduleName="configuracion">
              <Configuracion />
            </PrivateRoute>
          }
        />

        <Route
          path="/panel"
          element={
            <PrivateRoute moduleName="panel">
              <Panel />
            </PrivateRoute>
          }
        />

        <Route
          path="/cuadrillas"
          element={
            <PrivateRoute moduleName="cuadrillas">
              <Cuadrillas />
            </PrivateRoute>
          }
        />

        <Route
          path="/contador"
          element={
            <PrivateRoute moduleName="contador-dias">
              <Contador />
            </PrivateRoute>
          }
        />

        <Route
          path="/alertas"
          element={
            <PrivateRoute moduleName="alertas">
              <Alertas />
            </PrivateRoute>
          }
        />

        <Route
          path="/bitacora"
          element={
            <PrivateRoute moduleName="bitacora">
              <Bitacora />
            </PrivateRoute>
          }
        />

        <Route
          path="/clasificacion-reportes"
          element={
            <PrivateRoute moduleName="clasificacion-reportes">
              <Clasificacionreportes />
            </PrivateRoute>
          }
        />

        <Route
          path="/mensaje"
          element={
            <PrivateRoute moduleName="mensaje-dia">
              <Mensaje />
            </PrivateRoute>
          }
        />

        <Route
          path="/inicio-contador"
          element={
            <PrivateRoute moduleName="inicio-contador">
              <InicioContador />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
