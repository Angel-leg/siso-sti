export const moduleAccess = {
  MASTER: [
    "dashboard", //Pagina principal
    "usuarios", //Gestion de usuarios que pueden acceder al sistema
    "trabajadores", //Gestion de trabajadores
    "cuadrillas", //Gestion de cuadrillas
    "registro-incidentes", //Registro de incidentes
    "reportes", //Analisis y reportes power bi
    "contador-dias", //Se podra ver los dias sin accidentes
    //"alertas", //Mensaje de alerta, cuando se registra un incidente
    "bitacora", //Se registran todos los cambios en el sistema
    "clasificacion-reportes", //Se clasifican los reportes segun piramide de bird
    "mensaje-dia", //Mensajes del dia
    "inicio-contador" //Iniciar el contador de dias
  ],
  ADMINISTRADOR: [
    "dashboard", //Pagina principal
    "usuarios", //Gestion de usuarios que pueden acceder al sistema
    "trabajadores", //Gestion de trabajadores
    "cuadrillas", //Gestion de cuadrillas
    "registro-incidentes", //Registro de incidentes
    "reportes", //Clasificar los incidentes
    "contador-dias", //Se podra ver los dias sin accidentes
    //"alertas", //Mensaje de alerta, cuando se registra un incidente
    "bitacora", //Se registran todos los cambios en el sistema
    "clasificacion-reportes", //Se clasifican los reportes segun piramide de bird
    "mensaje-dia", //Mensajes del dia
    "inicio-contador" //Iniciar el contador de dias
  ],
  SISO: [
    "dashboard", //Pagina principal
    "trabajadores", //Gestion de trabajadores
    "cuadrillas", //Gestion de cuadrillas
    "registro-incidentes", //Registro de incidentes
    "reportes", //Clasificar los incidentes
    "contador-dias", //Se podra ver los dias sin accidentes
    //"alertas", //Mensaje de alerta, cuando se registra un incidente
    "mensaje-dia", //Mensajes del dia
    "clasificacion-reportes", //Se clasifican los reportes segun piramide de bird
  ],
  TECNICO: [
    "dashboard", //Pagina principal
    "registro-incidentes", //Registro de incidentes
    "contador-dias", //Se podra ver los dias sin accidentes
  ]
};
