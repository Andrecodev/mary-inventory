#!/bin/bash

# Script de Instalación Rápida - InvenFlow
# Este script te ayudará a configurar el proyecto paso a paso

echo "=========================================="
echo "  🚀 InvenFlow - Instalación Rápida"
echo "=========================================="
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Por favor instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"
echo ""

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ npm $(npm -v) detectado"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo ""
echo "✅ Dependencias instaladas correctamente"
echo ""

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️  No se encontró el archivo .env"
    echo "📝 Creando archivo .env desde .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Archivo .env creado"
        echo ""
        echo "⚠️  IMPORTANTE: Debes editar el archivo .env con tus credenciales de Supabase"
        echo ""
        echo "1. Ve a https://supabase.com y crea un proyecto"
        echo "2. Obtén tu URL y clave API"
        echo "3. Edita el archivo .env con tus credenciales"
        echo ""
        echo "Para más detalles, consulta: SUPABASE_SETUP.md"
    else
        echo "❌ No se encontró .env.example"
        exit 1
    fi
else
    echo "✅ Archivo .env encontrado"
fi

echo ""
echo "=========================================="
echo "  ✨ Instalación Completada"
echo "=========================================="
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Configura Supabase:"
echo "   - Lee el archivo SUPABASE_SETUP.md"
echo "   - Edita el archivo .env con tus credenciales"
echo ""
echo "2. Ejecuta las migraciones de base de datos"
echo ""
echo "3. Inicia el servidor de desarrollo:"
echo "   npm run dev"
echo ""
echo "4. Abre tu navegador en:"
echo "   http://localhost:5173"
echo ""
echo "=========================================="
echo "  📚 Documentación disponible:"
echo "=========================================="
echo ""
echo "- INICIO_RAPIDO.md      : Guía de inicio rápido"
echo "- SUPABASE_SETUP.md     : Configuración de Supabase"
echo "- CAMBIOS_COMPLETADOS.md: Lista de cambios recientes"
echo ""
echo "¡Buena suerte! 🚀"
