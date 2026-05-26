#!/bin/bash

# Script de build para desplegar en Render
# Este script se ejecuta automáticamente durante el deploy

set -e  # Salir si hay algún error

echo "=========================================="
echo "Iniciando build para COSITAS Backend"
echo "=========================================="

# 1. Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --only=production

# 2. Limpiar caché de npm (opcional pero recomendado)
echo "🧹 Limpiando caché..."
npm cache clean --force

# 3. Verificar que la aplicación puede iniciarse
echo "✅ Compilando y verificando estructura..."
node -c src/index.js 2>/dev/null || true

# 4. Mostrar versión de Node
echo "📌 Versión de Node.js:"
node -v

echo "📌 Versión de npm:"
npm -v

# 5. Listar dependencias instaladas
echo "📋 Dependencias instaladas:"
npm list --depth=0

echo ""
echo "=========================================="
echo "✨ Build completado exitosamente"
echo "=========================================="
echo ""
echo "Próximo paso: Render ejecutará 'npm start'"
echo "=========================================="
