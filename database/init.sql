-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-10-2025 a las 01:05:19
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `siso_sti_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `anuncios`
--

CREATE TABLE `anuncios` (
  `id_anuncio` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha_publicacion` date NOT NULL,
  `fecha_expiracion` date DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `visible` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `anuncios`
--

INSERT INTO `anuncios` (`id_anuncio`, `titulo`, `mensaje`, `fecha_publicacion`, `fecha_expiracion`, `creado_por`, `visible`) VALUES
(1, 'Revisión de extintores', '“Todos los extintores deben ser revisados y cargados antes del viernes. Reportar cualquier anomalía al encargado de seguridad.”', '2025-09-17', '2025-10-09', 1, 0),
(2, 'Uso obligatorio de casco', '“Se recuerda a todo el personal que el uso de casco es obligatorio en zonas de alta tensión. No se permitirá el ingreso sin equipo de protección.”', '2025-09-30', '2025-10-12', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bitacora`
--

CREATE TABLE `bitacora` (
  `id_bitacora` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `accion` varchar(255) NOT NULL,
  `fecha_hora` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bitacora`
--

INSERT INTO `bitacora` (`id_bitacora`, `id_usuario`, `accion`, `fecha_hora`) VALUES
(1, 1, 'Cuadrilla creada: Prueba-1', '2025-10-09 10:00:00'),
(2, 1, 'Cuadrilla creada: Prueba-2', '2025-10-09 10:00:28'),
(3, 1, 'Cuadrilla creada: Prueba-3', '2025-10-09 10:00:45'),
(4, 1, 'Trabajador creado: Angel Solorzano', '2025-10-09 10:02:52'),
(5, 1, 'Trabajador creado: Omar Zuleta', '2025-10-09 10:03:09'),
(6, 1, 'Trabajador creado: Luis Sosa', '2025-10-09 10:03:29'),
(7, 1, 'Trabajador creado: Jose Hernandez', '2025-10-09 10:03:49'),
(8, 1, 'Trabajador creado: Gerson Sec', '2025-10-09 10:04:05'),
(9, 1, 'Trabajador creado: Vinicio Hernandez', '2025-10-09 10:04:25'),
(10, 1, 'Reporte creado (ID: 1)', '2025-10-09 10:05:30'),
(11, 1, 'Incidente revisado (ID: 1)', '2025-10-09 10:06:15'),
(12, 1, 'Usuario creado: JGsiso', '2025-10-09 10:08:55'),
(13, 3, 'Reporte creado (ID: 2)', '2025-10-09 10:09:46'),
(14, 3, 'Reporte creado (ID: 3)', '2025-10-09 10:10:11'),
(15, 3, 'Reporte creado (ID: 4)', '2025-10-09 10:10:34'),
(16, 1, 'Incidente revisado (ID: 2)', '2025-10-09 10:11:12'),
(17, 1, 'Incidente revisado (ID: 3)', '2025-10-09 10:11:23'),
(18, 1, 'Incidente revisado (ID: 4)', '2025-10-09 10:11:35'),
(19, 1, 'Se inició el contador de días sin accidentes en 2025-10-09', '2025-10-09 10:25:31'),
(20, 1, 'Mensaje actualizado (ID: 2): Se modificó visible', '2025-10-10 12:49:02'),
(21, 1, 'Mensaje actualizado (ID: 2): Se modificó visible', '2025-10-10 12:54:39'),
(22, 1, 'Mensaje actualizado (ID: 2): Se modificó fecha_expiración, visible', '2025-10-10 12:54:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuadrillas`
--

CREATE TABLE `cuadrillas` (
  `id_cuadrilla` int(11) NOT NULL,
  `no_unidad` varchar(20) NOT NULL,
  `nombre_cuadrilla` varchar(100) NOT NULL,
  `zona_de_trabajo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuadrillas`
--

INSERT INTO `cuadrillas` (`id_cuadrilla`, `no_unidad`, `nombre_cuadrilla`, `zona_de_trabajo`) VALUES
(1, 'Prueba-1', 'Prueba-1', 'Guatemala'),
(2, 'Prueba-2', 'Prueba-2', 'Antigua Guatemala'),
(3, 'Prueba-3', 'Prueba-3', 'Escuintla');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dias_sin_accidentes`
--

CREATE TABLE `dias_sin_accidentes` (
  `id_contador` int(11) NOT NULL,
  `fecha_de_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `dias_totales` int(11) DEFAULT NULL,
  `id_incidente` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `dias_sin_accidentes`
--

INSERT INTO `dias_sin_accidentes` (`id_contador`, `fecha_de_inicio`, `fecha_fin`, `dias_totales`, `id_incidente`, `id_usuario`) VALUES
(1, '2025-10-09', NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gravedad_incidente`
--

CREATE TABLE `gravedad_incidente` (
  `id_gravedad` int(11) NOT NULL,
  `nivel` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gravedad_incidente`
--

INSERT INTO `gravedad_incidente` (`id_gravedad`, `nivel`, `descripcion`) VALUES
(1, 'Leve', 'Incidente sin consecuencias graves. Puede tratarse con primeros auxilios.'),
(2, 'Moderada', 'Incidente con lesión que requiere atención médica pero no hospitalización prolongada.'),
(3, 'Grave', 'Incidente con consecuencias serias como hospitalización, incapacidad o fatalidad.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `incidentes`
--

CREATE TABLE `incidentes` (
  `id_incidente` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  `id_reporte` int(11) NOT NULL,
  `id_tipo_incidente` int(11) NOT NULL,
  `id_gravedad` int(11) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `revisado_por` varchar(50) DEFAULT NULL,
  `fecha_revision` date DEFAULT NULL,
  `fecha_incidente` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `incidentes`
--

INSERT INTO `incidentes` (`id_incidente`, `descripcion`, `id_reporte`, `id_tipo_incidente`, `id_gravedad`, `status`, `revisado_por`, `fecha_revision`, `fecha_incidente`) VALUES
(1, 'Mal uso de EPP.', 1, 4, 1, 'Revisado', 'Angel Solorzano', '2025-10-09', '2025-10-09'),
(2, 'Mal uso de EPP y EPC.', 2, 4, 1, 'Revisado', 'Angel Solorzano', '2025-10-09', '2025-10-09'),
(3, 'Mal uso de EPP y EPC.', 3, 4, 1, 'Revisado', 'Angel Solorzano', '2025-10-09', '2025-10-09'),
(4, 'Mal uso de EPP y EPC.', 4, 3, 2, 'Revisado', 'Angel Solorzano', '2025-10-09', '2025-10-09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id_reporte` int(11) NOT NULL,
  `fecha_reporte` date NOT NULL,
  `ubicacion` varchar(150) NOT NULL,
  `id_tipo_trabajo` int(11) NOT NULL,
  `id_tension` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_cuadrilla` int(11) NOT NULL,
  `archivo_adjunto` varchar(255) NOT NULL,
  `descripcion` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reportes`
--

INSERT INTO `reportes` (`id_reporte`, `fecha_reporte`, `ubicacion`, `id_tipo_trabajo`, `id_tension`, `id_usuario`, `id_cuadrilla`, `archivo_adjunto`, `descripcion`) VALUES
(1, '2025-10-09', '14.663346772470323, -90.56178731486716', 2, 1, 1, 1, '1760025930304-para busqueda.png', 'Mal uso de EPP.'),
(2, '2025-10-09', '15.4974, -90.2525', 2, 1, 3, 1, '1760026186740-para busqueda.png', 'Mal uso de EPP y EPC.'),
(3, '2025-10-09', '14.663341818479973, -90.56180511915495', 1, 1, 3, 2, '1760026211041-para busqueda.png', 'Mal uso de EPP y EPC.'),
(4, '2025-10-09', '14.663417218090819, -90.56176819349994', 1, 1, 3, 3, '1760026234000-para busqueda.png', 'Mal uso de EPP y EPC.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(1, 'Master'),
(2, 'Administrador'),
(3, 'SISO'),
(4, 'Técnico'),
(5, 'Jefe de cuadrilla');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_incidente`
--

CREATE TABLE `tipo_incidente` (
  `id_tipo_incidente` int(11) NOT NULL,
  `tipo_incidente` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_incidente`
--

INSERT INTO `tipo_incidente` (`id_tipo_incidente`, `tipo_incidente`, `descripcion`) VALUES
(1, 'Accidente', 'Incidente que genera lesión o daño.'),
(2, 'Cuasiaccidente', 'Evento que no llegó a causar daño pero tenía el potencial.'),
(3, 'Acto Inseguro', 'Acción realizada por una persona que pone en riesgo la seguridad.'),
(4, 'Condición Insegura', 'Situación o entorno que representa un riesgo.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_trabajo`
--

CREATE TABLE `tipo_trabajo` (
  `id_tipo_trabajo` int(11) NOT NULL,
  `tipo_trabajo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_trabajo`
--

INSERT INTO `tipo_trabajo` (`id_tipo_trabajo`, `tipo_trabajo`) VALUES
(1, 'Energizado'),
(2, 'Desenergizado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trabajadores`
--

CREATE TABLE `trabajadores` (
  `id_trabajador` int(11) NOT NULL,
  `codigo_trabajador` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `puesto` varchar(50) NOT NULL,
  `id_cuadrilla` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trabajadores`
--

INSERT INTO `trabajadores` (`id_trabajador`, `codigo_trabajador`, `nombres`, `apellidos`, `puesto`, `id_cuadrilla`) VALUES
(1, '1', 'Angel', 'Solorzano', 'Aprendiz de liniero', 1),
(2, '2', 'Omar', 'Zuleta', 'Aprendiz de liniero', 1),
(3, '3', 'Luis', 'Sosa', 'Aprendiz de liniero', 2),
(4, '4', 'Jose', 'Hernandez', 'Aprendiz de liniero', 2),
(5, '5', 'Gerson', 'Sec', 'Aprendiz de liniero', 3),
(6, '6', 'Vinicio', 'Hernandez', 'Aprendiz de liniero', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trabajador_incidente`
--

CREATE TABLE `trabajador_incidente` (
  `id_trabajador` int(11) NOT NULL,
  `id_reporte` int(11) NOT NULL,
  `rol_en_incidente` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trabajador_incidente`
--

INSERT INTO `trabajador_incidente` (`id_trabajador`, `id_reporte`, `rol_en_incidente`, `observaciones`) VALUES
(1, 1, 'Mal uso de EPP.', 'Mal uso de EPP.'),
(1, 2, 'Mal uso de EPP y EPC.', 'Mal uso de EPP y EPC.'),
(4, 3, 'Mal uso de EPP y EPC.', 'Mal uso de EPP y EPC.'),
(5, 4, 'Mal uso de EPP y EPC.', 'Mal uso de EPP y EPC.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trabajo_tension`
--

CREATE TABLE `trabajo_tension` (
  `id_tension` int(11) NOT NULL,
  `rango_tension` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trabajo_tension`
--

INSERT INTO `trabajo_tension` (`id_tension`, `rango_tension`) VALUES
(1, 'Baja tensión'),
(2, 'Media tensión'),
(3, 'Alta tensión');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombres`, `apellidos`, `correo`, `usuario`, `contrasena`, `id_rol`, `estado`) VALUES
(1, 'Angel', 'Solorzano', 'ASmaster@siso.com', 'ASmaster', '$2b$10$Ws/YAM.4nH3kIsdpoJ8aoePW5NsDpj7I8YKG5DR.V1BlTOpzlxWL6', 1, 1),
(3, 'Jairo', 'Garcia', 'JGsiso@siso.com', 'JGsiso', '$2b$10$66NcthWNp7.FW/ZXSIXsRORU7j6D61b/EVlsIrKfsElgKB9hSFLHS', 4, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `anuncios`
--
ALTER TABLE `anuncios`
  ADD PRIMARY KEY (`id_anuncio`),
  ADD KEY `creado_por` (`creado_por`);

--
-- Indices de la tabla `bitacora`
--
ALTER TABLE `bitacora`
  ADD PRIMARY KEY (`id_bitacora`),
  ADD KEY `idusuario` (`id_usuario`);

--
-- Indices de la tabla `cuadrillas`
--
ALTER TABLE `cuadrillas`
  ADD PRIMARY KEY (`id_cuadrilla`),
  ADD UNIQUE KEY `no_unidad` (`no_unidad`);

--
-- Indices de la tabla `dias_sin_accidentes`
--
ALTER TABLE `dias_sin_accidentes`
  ADD PRIMARY KEY (`id_contador`),
  ADD KEY `id_incidente` (`id_incidente`),
  ADD KEY `idusuario` (`id_usuario`);

--
-- Indices de la tabla `gravedad_incidente`
--
ALTER TABLE `gravedad_incidente`
  ADD PRIMARY KEY (`id_gravedad`);

--
-- Indices de la tabla `incidentes`
--
ALTER TABLE `incidentes`
  ADD PRIMARY KEY (`id_incidente`),
  ADD KEY `id_reporte` (`id_reporte`),
  ADD KEY `id_tipo_incidente` (`id_tipo_incidente`),
  ADD KEY `id_gravedad` (`id_gravedad`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id_reporte`),
  ADD KEY `id_tipo_trabajo` (`id_tipo_trabajo`),
  ADD KEY `id_tension` (`id_tension`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_cuadrilla` (`id_cuadrilla`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `tipo_incidente`
--
ALTER TABLE `tipo_incidente`
  ADD PRIMARY KEY (`id_tipo_incidente`);

--
-- Indices de la tabla `tipo_trabajo`
--
ALTER TABLE `tipo_trabajo`
  ADD PRIMARY KEY (`id_tipo_trabajo`);

--
-- Indices de la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  ADD PRIMARY KEY (`id_trabajador`),
  ADD UNIQUE KEY `codigo_trabajador` (`codigo_trabajador`),
  ADD KEY `id_cuadrilla` (`id_cuadrilla`);

--
-- Indices de la tabla `trabajador_incidente`
--
ALTER TABLE `trabajador_incidente`
  ADD PRIMARY KEY (`id_trabajador`,`id_reporte`),
  ADD KEY `id_reporte` (`id_reporte`);

--
-- Indices de la tabla `trabajo_tension`
--
ALTER TABLE `trabajo_tension`
  ADD PRIMARY KEY (`id_tension`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD KEY `id_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `anuncios`
--
ALTER TABLE `anuncios`
  MODIFY `id_anuncio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `bitacora`
--
ALTER TABLE `bitacora`
  MODIFY `id_bitacora` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `cuadrillas`
--
ALTER TABLE `cuadrillas`
  MODIFY `id_cuadrilla` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `dias_sin_accidentes`
--
ALTER TABLE `dias_sin_accidentes`
  MODIFY `id_contador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `gravedad_incidente`
--
ALTER TABLE `gravedad_incidente`
  MODIFY `id_gravedad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `incidentes`
--
ALTER TABLE `incidentes`
  MODIFY `id_incidente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tipo_incidente`
--
ALTER TABLE `tipo_incidente`
  MODIFY `id_tipo_incidente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tipo_trabajo`
--
ALTER TABLE `tipo_trabajo`
  MODIFY `id_tipo_trabajo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  MODIFY `id_trabajador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `trabajo_tension`
--
ALTER TABLE `trabajo_tension`
  MODIFY `id_tension` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `anuncios`
--
ALTER TABLE `anuncios`
  ADD CONSTRAINT `anuncios_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `bitacora`
--
ALTER TABLE `bitacora`
  ADD CONSTRAINT `bitacora_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `dias_sin_accidentes`
--
ALTER TABLE `dias_sin_accidentes`
  ADD CONSTRAINT `dias_sin_accidentes_ibfk_1` FOREIGN KEY (`id_incidente`) REFERENCES `incidentes` (`id_incidente`),
  ADD CONSTRAINT `dias_sin_accidentes_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `incidentes`
--
ALTER TABLE `incidentes`
  ADD CONSTRAINT `incidentes_ibfk_1` FOREIGN KEY (`id_reporte`) REFERENCES `reportes` (`id_reporte`),
  ADD CONSTRAINT `incidentes_ibfk_2` FOREIGN KEY (`id_tipo_incidente`) REFERENCES `tipo_incidente` (`id_tipo_incidente`),
  ADD CONSTRAINT `incidentes_ibfk_3` FOREIGN KEY (`id_gravedad`) REFERENCES `gravedad_incidente` (`id_gravedad`);

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`id_tipo_trabajo`) REFERENCES `tipo_trabajo` (`id_tipo_trabajo`),
  ADD CONSTRAINT `reportes_ibfk_2` FOREIGN KEY (`id_tension`) REFERENCES `trabajo_tension` (`id_tension`),
  ADD CONSTRAINT `reportes_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `reportes_ibfk_4` FOREIGN KEY (`id_cuadrilla`) REFERENCES `cuadrillas` (`id_cuadrilla`);

--
-- Filtros para la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  ADD CONSTRAINT `trabajadores_ibfk_1` FOREIGN KEY (`id_cuadrilla`) REFERENCES `cuadrillas` (`id_cuadrilla`);

--
-- Filtros para la tabla `trabajador_incidente`
--
ALTER TABLE `trabajador_incidente`
  ADD CONSTRAINT `trabajador_incidente_ibfk_1` FOREIGN KEY (`id_trabajador`) REFERENCES `trabajadores` (`id_trabajador`),
  ADD CONSTRAINT `trabajador_incidente_ibfk_2` FOREIGN KEY (`id_reporte`) REFERENCES `reportes` (`id_reporte`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
