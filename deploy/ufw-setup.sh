#!/bin/bash

# Configuración del firewall UFW

echo "Configurando UFW..."

# Habilitar UFW
sudo ufw --force enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir MySQL (solo localhost)
sudo ufw allow from 127.0.0.1 to 127.0.0.1 port 3306

# Ver estado
sudo ufw status verbose

echo "Firewall configurado"
