#!/bin/bash

# Script para crear base de datos y usuario MySQL

MYSQL_ROOT_PASSWORD=$1
DB_NAME="cositas_db"
DB_USER="cositas_user"
DB_PASSWORD=$2

if [ -z "$MYSQL_ROOT_PASSWORD" ] || [ -z "$DB_PASSWORD" ]; then
    echo "Uso: ./setup-db.sh <mysql_root_password> <db_password>"
    exit 1
fi

echo "🗄️ Creando base de datos..."

mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✅ Base de datos creada"
echo "Usuario: $DB_USER"
echo "Base de datos: $DB_NAME"
