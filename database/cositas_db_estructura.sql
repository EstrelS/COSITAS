-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cositas_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `busquedas_guardadas`
--

DROP TABLE IF EXISTS `busquedas_guardadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `busquedas_guardadas` (
  `id_busqueda` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `nombre_busqueda` varchar(255) DEFAULT NULL,
  `paremetros` text DEFAULT NULL,
  `frecuencia_notificacion` varchar(50) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_busqueda`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `busquedas_guardadas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `calificaciones`
--

DROP TABLE IF EXISTS `calificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calificaciones` (
  `id_calificacion` int(11) NOT NULL AUTO_INCREMENT,
  `id_transaccion` int(11) NOT NULL,
  `id_calificador` int(11) NOT NULL,
  `id_calificado` int(11) NOT NULL,
  `puntiacion` int(11) NOT NULL,
  `omentario` text DEFAULT NULL,
  `fecha_calificacion` datetime DEFAULT current_timestamp(),
  `tipo_calificacion` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_calificacion`),
  UNIQUE KEY `id_transaccion` (`id_transaccion`),
  KEY `id_calificador` (`id_calificador`),
  KEY `id_calificado` (`id_calificado`),
  CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`id_transaccion`) REFERENCES `transacciones` (`id_transacciones`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`id_calificador`) REFERENCES `usuarios` (`id_usuario`) ON DELETE NO ACTION,
  CONSTRAINT `calificaciones_ibfk_3` FOREIGN KEY (`id_calificado`) REFERENCES `usuarios` (`id_usuario`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_categoria_padre` int(11) DEFAULT NULL,
  `icono_url` varchar(255) DEFAULT NULL,
  `orden_visualizacion` int(11) DEFAULT 0,
  `activa` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_categoria`),
  KEY `id_categoria_padre` (`id_categoria_padre`),
  CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`id_categoria_padre`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conversaciones`
--

DROP TABLE IF EXISTS `conversaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversaciones` (
  `id_conversacion` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario_1` int(11) NOT NULL,
  `id_usuario_2` int(11) NOT NULL,
  `id_producto_relacionado` int(11) DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT current_timestamp(),
  `fecha_ultimo_mensaje` datetime DEFAULT NULL,
  `estado_conversacion` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_conversacion`),
  KEY `id_usuario_1` (`id_usuario_1`),
  KEY `id_usuario_2` (`id_usuario_2`),
  KEY `id_producto_relacionado` (`id_producto_relacionado`),
  CONSTRAINT `conversaciones_ibfk_1` FOREIGN KEY (`id_usuario_1`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `conversaciones_ibfk_2` FOREIGN KEY (`id_usuario_2`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `conversaciones_ibfk_3` FOREIGN KEY (`id_producto_relacionado`) REFERENCES `productos` (`id_productos`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favoritos`
--

DROP TABLE IF EXISTS `favoritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoritos` (
  `id_favorito` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `fecha_agregado` datetime DEFAULT current_timestamp(),
  `notas_usuario` text DEFAULT NULL,
  PRIMARY KEY (`id_favorito`),
  UNIQUE KEY `id_usuario` (`id_usuario`,`id_producto`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_productos`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `historial_busquedas`
--

DROP TABLE IF EXISTS `historial_busquedas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_busquedas` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `query_busqueda` varchar(255) DEFAULT NULL,
  `filtros_aplicados` text DEFAULT NULL,
  `resultados_encontrados` int(11) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `id_producto_clickeado` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_producto_clickeado` (`id_producto_clickeado`),
  CONSTRAINT `historial_busquedas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `historial_busquedas_ibfk_2` FOREIGN KEY (`id_producto_clickeado`) REFERENCES `productos` (`id_productos`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `imagenes_producto`
--

DROP TABLE IF EXISTS `imagenes_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagenes_producto` (
  `id_imagenes` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `url_imagen` varchar(255) NOT NULL,
  `url_thumbnail` varchar(255) DEFAULT NULL,
  `fecha_subida` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_imagenes`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `imagenes_producto_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_productos`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mensajes_chat`
--

DROP TABLE IF EXISTS `mensajes_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_chat` (
  `id_mensaje` int(11) NOT NULL AUTO_INCREMENT,
  `id_conversacion` int(11) NOT NULL,
  `id_emisor` int(11) NOT NULL,
  `id_resceptor` int(11) NOT NULL,
  `contenido_mensaje` text DEFAULT NULL,
  `timestamp_leido` datetime DEFAULT NULL,
  `estado_mensaje` varchar(50) DEFAULT 'enviado',
  `tipo_mensaje` varchar(50) DEFAULT 'texto',
  PRIMARY KEY (`id_mensaje`),
  KEY `id_conversacion` (`id_conversacion`),
  KEY `id_emisor` (`id_emisor`),
  KEY `id_resceptor` (`id_resceptor`),
  CONSTRAINT `mensajes_chat_ibfk_1` FOREIGN KEY (`id_conversacion`) REFERENCES `conversaciones` (`id_conversacion`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_chat_ibfk_2` FOREIGN KEY (`id_emisor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE NO ACTION,
  CONSTRAINT `mensajes_chat_ibfk_3` FOREIGN KEY (`id_resceptor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id_notificaiones` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `tipo_notificacion` varchar(100) DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `contenido` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_leida` datetime DEFAULT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `accion_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_notificaiones`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `perfil_artesano`
--

DROP TABLE IF EXISTS `perfil_artesano`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `perfil_artesano` (
  `id_artesano` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `especialidad` varchar(255) DEFAULT NULL,
  `decripcion_taller` text DEFAULT NULL,
  `años_experiencia` int(11) DEFAULT NULL,
  `certificaciones` text DEFAULT NULL,
  `historia_aresano` text DEFAULT NULL,
  `redes_sociales_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`redes_sociales_json`)),
  `verificado_artesano` tinyint(1) DEFAULT 0,
  `fecha_verificacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_artesano`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `perfil_artesano_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `perfil_negocios`
--

DROP TABLE IF EXISTS `perfil_negocios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `perfil_negocios` (
  `id_perfil_negocio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_negocio` varchar(255) NOT NULL,
  `razon_social` varchar(255) DEFAULT NULL,
  `rfc` varchar(13) DEFAULT NULL,
  `giro_comercial` varchar(255) DEFAULT NULL,
  `descipcion_negocio` text DEFAULT NULL,
  `horario_atencion` varchar(255) DEFAULT NULL,
  `sitio_web` varchar(255) DEFAULT NULL,
  `verificado_negocio` tinyint(1) DEFAULT 0,
  `fecha_verificacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_perfil_negocio`),
  UNIQUE KEY `rfc` (`rfc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_productos` int(11) NOT NULL AUTO_INCREMENT,
  `id_vendedor` int(11) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `decripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `subcategoria` varchar(100) DEFAULT NULL,
  `estado_producto` varchar(50) DEFAULT NULL,
  `cantidad_disponible` int(11) DEFAULT 0,
  `fecha_publicacion` datetime DEFAULT current_timestamp(),
  `estado_publicacion` varchar(50) DEFAULT 'borrador',
  `vistas` int(11) DEFAULT 0,
  `favoritos` int(11) DEFAULT 0,
  PRIMARY KEY (`id_productos`),
  KEY `id_vendedor` (`id_vendedor`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_vendedor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reportes`
--

DROP TABLE IF EXISTS `reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes` (
  `id_reporte` int(11) NOT NULL AUTO_INCREMENT,
  `id_reportante` int(11) NOT NULL,
  `tipo_elemento_reportado` varchar(100) DEFAULT NULL,
  `id_elemento_reportado` int(11) NOT NULL,
  `motivo_reporte` varchar(255) DEFAULT NULL,
  `descripcion_detallada` text DEFAULT NULL,
  `evidencia_url` varchar(255) DEFAULT NULL,
  `estado_reporte` varchar(50) DEFAULT 'pendiente',
  `fecha_reporte` datetime DEFAULT current_timestamp(),
  `fecha_resolucion` datetime DEFAULT NULL,
  `id_moderador` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `id_reportante` (`id_reportante`),
  KEY `id_moderador` (`id_moderador`),
  CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`id_reportante`) REFERENCES `usuarios` (`id_usuario`) ON DELETE NO ACTION,
  CONSTRAINT `reportes_ibfk_2` FOREIGN KEY (`id_moderador`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transacciones`
--

DROP TABLE IF EXISTS `transacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacciones` (
  `id_transacciones` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `id_comprador` int(11) NOT NULL,
  `id_vendedor` int(11) NOT NULL,
  `metodo_pago` varchar(100) DEFAULT NULL,
  `estado_transaccion` varchar(50) DEFAULT NULL,
  `fecha_transaccion` datetime DEFAULT current_timestamp(),
  `fecha_completa` datetime DEFAULT NULL,
  `notas_transacciones` text DEFAULT NULL,
  PRIMARY KEY (`id_transacciones`),
  KEY `id_producto` (`id_producto`),
  KEY `id_comprador` (`id_comprador`),
  KEY `id_vendedor` (`id_vendedor`),
  CONSTRAINT `transacciones_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_productos`) ON DELETE NO ACTION,
  CONSTRAINT `transacciones_ibfk_2` FOREIGN KEY (`id_comprador`) REFERENCES `usuarios` (`id_usuario`) ON DELETE NO ACTION,
  CONSTRAINT `transacciones_ibfk_3` FOREIGN KEY (`id_vendedor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ubicaciones`
--

DROP TABLE IF EXISTS `ubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicaciones` (
  `id_ubicaciones` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `colonia` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `timestamp_actualizacion` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_ubicaciones`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `ubicaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_usuario` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido_paterno` varchar(100) NOT NULL,
  `apellido_materno` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `ultima_actualizacion` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `estado_de_cuenta` varchar(50) DEFAULT 'activo',
  `calificacion_promedio` decimal(3,2) DEFAULT 0.00,
  `verificado` tinyint(1) DEFAULT 0,
  `foto_perfil_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'cositas_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-23 15:11:24
