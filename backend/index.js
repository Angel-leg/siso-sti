const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const db = require('./config/db');
const cuadrillasRoutes = require("./routes/cuadrillas.routes");
const usuariosRoutes = require('./routes/usuarios.routes');
const trabajadoresRoutes = require('./routes/trabajadores.routes');
const mensajesRoutes = require('./routes/mensaje.routes');
const registroIncidentesRoutes = require("./routes/registroIncidentes.routes");
const clasificacionincidentesRouter = require("./routes/clasificacionincidentes.routes");
const path = require('path');
const inicioContadorRoutes = require('./routes/InicioContador.routes');
const bitacoraRoutes = require('./routes/bitacora.routes');
//const analisisRouter = require('./routes/analisis.route');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

//Middleware
app.use(cors());
app.use(express.json());

//Rutas
app.use('/api/cuadrillas', cuadrillasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/trabajadores', trabajadoresRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/registro-incidentes', registroIncidentesRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/incidentes", clasificacionincidentesRouter);
//Esto permite acceder a los archivos de la carpeta 'uploads' vía HTTP
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/contador', inicioContadorRoutes);
app.use('/api/bitacora', bitacoraRoutes);
//app.use('/api/analisis', analisisRouter);
app.get('/', (req, res) => {
  res.send('¡Servidor backend funcionando desde Ngrok!');
});

//Probar conexión a la base de datos async/await
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Conectado a la base de datos');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
  }
})();

//Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
