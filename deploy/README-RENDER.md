# 🚀 Guía de Despliegue en Render

## Configuración para Desplegar COSITAS Backend en Render

### 📋 Requisitos Previos
- Cuenta en [Render.com](https://render.com)
- Repositorio Git con tu código
- Variables de entorno configuradas

---

## 1️⃣ Crear un Web Service en Render

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio GitHub
4. Selecciona la rama (generalmente `main` o `master`)

---

## 2️⃣ Configuración del Service

### Información Básica
- **Name**: `cositas-backend`
- **Region**: `Ohio (US-EAST)` (recomendado para baja latencia)
- **Branch**: `main` o la rama que uses
- **Runtime**: `Node`
- **Build Command**: `./backend/build.sh`
- **Start Command**: `cd backend && npm start`
- **Plan**: Usa el que prefieras (Free está disponible)

---

## 3️⃣ Variables de Entorno

En Render, ve a **"Environment"** y agrega estas variables:

```
DB_HOST=tu_host_aiven.aivencloud.com
DB_PORT=tu_puerto_bd
DB_USER=tu_usuario_bd
DB_PASSWORD=tu_contraseña_bd_segura
DB_NAME=tu_nombre_bd

PORT=5000
NODE_ENV=production

JWT_SECRET=tu_secreto_jwt_muy_seguro_cambiar

FRONTEND_URL=https://tu-frontend-url.vercel.app

AES_SECRET_KEY=tu_clave_aes_segura_cambiar

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_contraseña_app

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

⚠️ **IMPORTANTE**: 
- Reemplaza TODOS los valores con tus credenciales reales
- NUNCA expongas contraseñas en el código
- Usa variables de entorno en Render para guardar secretos

---

## 4️⃣ Configuración Avanzada

### Health Check (Opcional pero Recomendado)
- **Health Check Path**: `/` o `/api/health` (si tienes este endpoint)
- **Health Check Protocol**: `HTTP`

### Autoscaling (Para plan pagado)
- Enable autoscaling si esperas tráfico variable
- Min Instances: 1
- Max Instances: 3

---

## 5️⃣ Estructura de Carpetas Esperada

Tu repositorio debe tener esta estructura:
```
COSITAS/
├── backend/
│   ├── build.sh          ← Script que creamos
│   ├── package.json
│   ├── src/
│   │   └── index.js
│   └── ...
├── frontend/
│   ├── package.json
│   └── ...
└── ...
```

---

## 6️⃣ Desplegar

1. Haz push de tu código a GitHub
2. En Render, haz clic en **"Deploy"**
3. Monitorea los logs en tiempo real

---

## 7️⃣ Verificar que Todo Funciona

Una vez desplegado:

```bash
# Ver logs
# Ve a Logs en el dashboard de Render

# Probar la API
curl https://cositas-backend.onrender.com

# Si tienes un endpoint health
curl https://cositas-backend.onrender.com/api/health
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "npm: not found"
- Render debería incluir npm automáticamente
- Verifica que tu `build.sh` es ejecutable

### Error: "Cannot find module"
- Ejecuta `npm ci --only=production` en build.sh ✓ (Ya incluido)

### Error: Conexión a Base de Datos rechazada
- Verifica que tu BD acepta conexiones externas
- Comprueba el firewall en Aiven
- Verifica credenciales en variables de entorno

### Error: Puerto 5000 no disponible
- Render asigna dinámicamente un puerto
- Asegúrate de usar `process.env.PORT` en tu `index.js`

---

## 📡 Actualizar Build Command en Render

Si cambias la estructura, modifica en Render:
- Ve a **Settings** → **Build Command**
- Actualiza a: `cd backend && npm ci --only=production`

---

## 🔄 Despliegue Automático

Render desplegará automáticamente cada vez que hagas push a tu rama configurada.

---

## 📚 Enlaces Útiles

- [Documentación Render](https://render.com/docs)
- [Desplegar Node.js en Render](https://render.com/docs/deploy-node-express-app)
- [Variables de Entorno en Render](https://render.com/docs/environment-variables)

---

## ✅ Checklist Antes de Desplegar

- [ ] Código en GitHub
- [ ] Variables de entorno configuradas en Render
- [ ] Base de datos accesible externamente
- [ ] JWT_SECRET diferente a desarrollo
- [ ] FRONTEND_URL apunta a tu frontend real
- [ ] build.sh tiene permisos de ejecución
- [ ] package.json tiene script "start"

---

**¡Tu backend está listo para Render! 🚀**
