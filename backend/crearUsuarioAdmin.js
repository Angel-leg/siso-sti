const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const crearUsuario = async () => {
  try {
    //Conexión a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'siso_sti_db',
    });

    //Datos del nuevo usuario
    const nombres = 'Angel';
    const apellidos = 'Solorzano';
    const correo = 'master@siso.com';
    const usuario = 'Master';
    const contrasena = 'master123';
    const id_rol = 1;

    //Encriptar la contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    //Insertar en la base de datos
    const [result] = await connection.execute(
      `INSERT INTO usuarios (nombres, apellidos, correo, usuario, contrasena, id_rol)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, correo, usuario, hash, id_rol]
    );

    console.log('Usuario creado correctamente con ID:', result.insertId);
    await connection.end();
  } catch (error) {
    console.error('Error al crear el usuario:', error.message);
  }
};

crearUsuario();
