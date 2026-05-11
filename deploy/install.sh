#!/bin/bash

# Script de instalación para COSITAS en Ubuntu 20.04+

set -e

echo "Iniciando instalación de COSITAS..."

# Actualizar sistema
echo "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
echo "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
echo "Instalando MySQL Server..."
sudo apt install -y mysql-server

# Instalar NGINX
echo "Instalando NGINX..."
sudo apt install -y nginx

# Instalar PM2
echo "Instalando PM2..."
sudo npm install -g pm2

# Instalar Certbot (SSL)
echo "Instalando Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Crear directorio para la aplicación
echo "Creando directorios..."
sudo mkdir -p /home/cositas
sudo chown -R $USER:$USER /home/cositas

# Clonar o crear estructura de directorios
mkdir -p /home/cositas/{backend,frontend,uploads}

echo "Instalación completada"
echo ""
echo "Próximos pasos:"
echo "1. Copiar archivos del backend a /home/cositas/backend"
echo "2. Copiar archivos del frontend a /home/cositas/frontend"
echo "3. Crear archivo .env en backend con credenciales de BD"
echo "4. Ejecutar: npm install en backend y frontend"
echo "5. Configurar certificado SSL: sudo certbot certonly --nginx -d tu_dominio.com"
echo "6. Copiar nginx.conf a /etc/nginx/sites-available/cositas"
echo "7. Activar: sudo ln -s /etc/nginx/sites-available/cositas /etc/nginx/sites-enabled/"
