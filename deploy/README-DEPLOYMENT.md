# Guía de Despliegue de COSITAS en Linux (Ubuntu 20.04+)

## Requisitos Previos
- Servidor Ubuntu 20.04 o superior
- Dominio registrado (opcional, puede ser IP)
- Acceso root o sudo
- 2GB RAM mínimo
- 20GB almacenamiento

## Paso 1: Preparar el Servidor

### 1.1 Actualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Ejecutar script de instalación
```bash
cd /ruta/al/proyecto/deploy
chmod +x install.sh
./install.sh
```

## Paso 2: Configurar Base de Datos

### 2.1 Crear base de datos y usuario
```bash
chmod +x setup-db.sh
./setup-db.sh <mysql_root_password> <cositas_db_password>
```

### 2.2 Importar script SQL
```bash
mysql -u cositas_user -p cositas_db < ../database/cositas.sql
```

## Paso 3: Desplegar Backend

### 3.1 Copiar archivos
```bash
scp -r backend/ usuario@servidor:/home/cositas/
```

### 3.2 Instalar dependencias
```bash
cd /home/cositas/backend
npm install --production
```

### 3.3 Crear archivo .env
```bash
cp .env.example .env
nano .env  # Editar con valores reales
```

### 3.4 Iniciar con PM2
```bash
cd /home/cositas/backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Paso 4: Desplegar Frontend

### 4.1 Copiar archivos
```bash
scp -r frontend/ usuario@servidor:/home/cositas/
```

### 4.2 Instalar dependencias
```bash
cd /home/cositas/frontend
npm install --production
```

### 4.3 Compilar
```bash
REACT_APP_API_URL=https://tu_dominio.com/api/v1 npm run build
```

## Paso 5: Configurar NGINX

### 5.1 Copiar configuración
```bash
sudo cp nginx.conf /etc/nginx/sites-available/cositas
```

### 5.2 Habilitar sitio
```bash
sudo ln -s /etc/nginx/sites-available/cositas /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

### 5.3 Validar y recargar
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Paso 6: Certificado SSL con Certbot

### 6.1 Generar certificado
```bash
sudo certbot certonly --nginx -d tu_dominio.com -d www.tu_dominio.com
```

### 6.2 Renovación automática
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Paso 7: Configurar Firewall

### 7.1 Ejecutar script
```bash
chmod +x ufw-setup.sh
./ufw-setup.sh
```

## Verificación

### Revisar estado de servicios
```bash
# Backend
pm2 status
pm2 logs cositas-backend

# NGINX
sudo systemctl status nginx
sudo nginx -t

# MySQL
sudo systemctl status mysql

# UFW
sudo ufw status
```

### Probar endpoints
```bash
# Login
curl -X POST https://tu_dominio.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cositas.com","password":"admin123"}'

# Obtener productos
curl https://tu_dominio.com/api/v1/productos
```

## Solución de Problemas

### Backend no arranca
```bash
cd /home/cositas/backend
npm start  # Ver errores directamente
```

### NGINX no reconoce certificado
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### Permisos de archivos
```bash
sudo chown -R cositas:cositas /home/cositas
chmod -R 755 /home/cositas
chmod -R 775 /home/cositas/backend/uploads
```

### Logs
```bash
# NGINX
sudo tail -f /var/log/nginx/cositas_error.log
sudo tail -f /var/log/nginx/cositas_access.log

# PM2
pm2 logs
tail -f /var/log/pm2/cositas-error.log

# MySQL
sudo tail -f /var/log/mysql/error.log
```

## Comandos Útiles

```bash
# PM2
pm2 restart cositas-backend
pm2 stop cositas-backend
pm2 delete cositas-backend

# NGINX
sudo systemctl restart nginx
sudo systemctl reload nginx

# MySQL
mysql -u cositas_user -p cositas_db
SHOW DATABASES;
USE cositas_db;
SELECT * FROM usuarios;

# UFW
sudo ufw allow/deny <port>
sudo ufw status
```
