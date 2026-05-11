# Tabla Completa de Endpoints COSITAS API v1

## Base URL
```
http://localhost:5000/api/v1
```

---

## 🔐 AUTENTICACIÓN

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| POST | `/auth/registro` | Registrar usuario | ❌ | `{ nombre, email, password, tipo_usuario }` |
| POST | `/auth/login` | Iniciar sesión | ❌ | `{ email, password }` |

---

## 👤 USUARIOS

| Método | Endpoint | Descripción | Auth | Parámetros |
|--------|----------|-------------|------|-----------|
| GET | `/usuarios/perfil` | Obtener perfil propio | ✅ | - |
| PUT | `/usuarios/perfil` | Actualizar perfil | ✅ | `{ nombre, foto_perfil_url }` |
| POST | `/usuarios/cambiar-password` | Cambiar contraseña | ✅ | `{ password_antigua, password_nueva }` |
| GET | `/usuarios/:id` | Obtener usuario público | ❌ | - |

---

## 🎨 ARTESANOS

| Método | Endpoint | Descripción | Auth | Rol | Body |
|--------|----------|-------------|------|-----|------|
| GET | `/artesanos` | Listar artesanos verificados | ❌ | - | - |
| GET | `/artesanos/:id` | Obtener perfil artesano | ❌ | - | - |
| PUT | `/artesanos/perfil` | Actualizar perfil artesano | ✅ | artesano | `{ especialidad, descripción, años_experiencia, redes_sociales }` |

---

## 📦 PRODUCTOS

| Método | Endpoint | Descripción | Auth | Rol | Parámetros |
|--------|----------|-------------|------|-----|-----------|
| GET | `/productos` | Listar productos | ❌ | - | `?busqueda=&categoria=&vendedor=` |
| GET | `/productos/:id` | Obtener detalle producto | ❌ | - | - |
| POST | `/productos` | Crear producto | ✅ | artesano | `{ nombre, precio, cantidad_disponible, descripcion, id_categoria, fotos }` |
| PUT | `/productos/:id` | Actualizar producto | ✅ | artesano | `{ nombre, precio, cantidad_disponible, descripcion, id_categoria, fotos }` |
| DELETE | `/productos/:id` | Eliminar producto (lógico) | ✅ | artesano | - |
| PATCH | `/productos/:id/pausar` | Pausar producto | ✅ | artesano | - |

---

## 🏷️ CATEGORÍAS

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| GET | `/categorias` | Listar categorías | ❌ | - |
| POST | `/categorias` | Crear categoría | ✅ | admin | `{ nombre_categoria, id_categoria_padre }` |

---

## 💳 TRANSACCIONES

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| GET | `/transacciones` | Obtener compras del usuario | ✅ | - |
| POST | `/transacciones` | Crear compra | ✅ | `{ id_producto, cantidad }` |
| PATCH | `/transacciones/:id` | Actualizar estado | ✅ | `{ estado_transaccion }` |

---

## ⭐ CALIFICACIONES

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| POST | `/calificaciones` | Crear calificación | ✅ | `{ id_transaccion, puntuacion, comentario }` |
| GET | `/calificaciones/producto/:id_producto` | Obtener calificaciones producto | ❌ | - |

---

## ❤️ FAVORITOS

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| POST | `/favoritos` | Agregar favorito | ✅ | `{ id_producto }` |
| GET | `/favoritos` | Obtener mis favoritos | ✅ | - |
| DELETE | `/favoritos/:id_producto` | Remover de favoritos | ✅ | - |

---

## 💬 CONVERSACIONES Y MENSAJES

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| POST | `/conversaciones` | Crear conversación | ✅ | `{ id_usuario_2, id_producto_relacionado }` |
| GET | `/conversaciones` | Obtener mis conversaciones | ✅ | - |
| POST | `/mensajes` | Enviar mensaje | ✅ | `{ id_conversacion, contenido }` |
| GET | `/mensajes/:id_conversacion` | Obtener mensajes | ✅ | - |

---

## 📢 NOTIFICACIONES

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/notificaciones` | Obtener notificaciones | ✅ |
| PATCH | `/notificaciones/:id/leer` | Marcar como leída | ✅ |

---

## 🚩 REPORTES

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| POST | `/reportes` | Crear reporte | ✅ | `{ id_usuario_reportado, id_producto_reportado, motivo_reporte, descripcion }` |
| GET | `/reportes` | Obtener reportes | ✅ Admin | - |

---

## 📍 UBICACIONES

| Método | Endpoint | Descripción | Auth | Body |
|--------|----------|-------------|------|------|
| POST | `/ubicaciones` | Crear/Actualizar ubicación | ✅ | `{ latitud, longitud, ciudad, direccion_completa }` |
| GET | `/ubicaciones` | Obtener mi ubicación | ✅ | - |

---

## 🔍 BÚSQUEDA

| Método | Endpoint | Descripción | Auth | Parámetros |
|--------|----------|-------------|------|-----------|
| GET | `/busqueda` | Buscar productos | ❌ | `?q=&categoria=&precio_min=&precio_max=` |
| GET | `/busqueda/historial` | Historial de búsquedas | ✅ | - |

---

## 👨‍💼 ADMIN

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| GET | `/admin/dashboard/stats` | Dashboard estadísticas | ✅ | admin |
| PATCH | `/admin/artesanos/:id/verificar` | Verificar artesano | ✅ | admin |
| PATCH | `/admin/usuarios/:id/suspender` | Suspender usuario | ✅ | admin |
| PATCH | `/admin/reportes/:id/resolver` | Resolver reporte | ✅ | admin |

---

## Ejemplos de Uso

### 1. Registro e Inicio de Sesión
```bash
# Registrarse
curl -X POST http://localhost:5000/api/v1/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "tipo_usuario": "comprador"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
# Respuesta: { token: "eyJhbGc...", usuario: {...} }
```

### 2. Crear Producto (con token)
```bash
curl -X POST http://localhost:5000/api/v1/productos \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Collar Artesanal",
    "precio": 45.99,
    "cantidad_disponible": 10,
    "descripcion": "Collar hecho a mano con materiales naturales",
    "id_categoria": 2,
    "fotos": ["https://example.com/photo.jpg"]
  }'
```

### 3. Buscar Productos
```bash
curl http://localhost:5000/api/v1/productos?busqueda=collar&categoria=2&precio_max=100
```

### 4. Realizar Compra
```bash
curl -X POST http://localhost:5000/api/v1/transacciones \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "id_producto": 5,
    "cantidad": 2
  }'
```

### 5. Enviar Mensaje
```bash
curl -X POST http://localhost:5000/api/v1/mensajes \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "id_conversacion": 1,
    "contenido": "¿Disponible para hacer un personalizado?"
  }'
```

---

## Códigos de Respuesta

| Código | Significado |
|--------|------------|
| 200 | OK - Éxito |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Error en validación |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - No autorizado por rol |
| 404 | Not Found - Recurso no encontrado |
| 500 | Server Error - Error interno |

---

## Headers Requeridos

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>  (para rutas protegidas)
```

---

## Roles de Usuario

- **comprador**: Puede comprar, calificar, agregar favoritos, reportar
- **artesano**: Puede crear/editar productos, verificar compras
- **administrador**: Acceso completo al panel admin
