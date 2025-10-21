const db = require('../config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function crearUsuarioAdmin() {
  try {
    const nombres = 'Angel';
    const apellidos = 'Solorzano';
    const correo = 'ASmaster@siso.com';
    const usuario = 'ASmaster';
    const contrasena = 'master123';
    const id_rol = 1;
    const estado = 1; // 1 Activo 0 Inactivo

    //Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    //Insertar en la base de datos
    const [result] = await db.query(
      `INSERT INTO usuarios 
        (nombres, apellidos, correo, usuario, contrasena, id_rol, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, correo, usuario, hashedPassword, id_rol, estado]
    );

    console.log('Usuario administrador creado con éxito');
  } catch (error) {
    console.error('Error al crear el usuario:', error.message);
  }
}

crearUsuarioAdmin();
