#!/bin/bash

# Script de démarrage pour AI-Karangué 2025
# Auteur: Assistant AI
# Date: 2025-09-09

echo "🚀 Démarrage d'AI-Karangué 2025..."
echo "======================================"

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier les données
if [ ! -d "data" ]; then
    echo "📁 Création du dossier data..."
    mkdir -p data
fi

if [ ! -f "data/places.json" ]; then
    echo "📝 Création du fichier places.json..."
    echo '{"total": 1000, "reserved": 0, "available": 1000}' > data/places.json
fi

if [ ! -f "data/tickets.json" ]; then
    echo "📝 Création du fichier tickets.json..."
    echo '{"tickets": []}' > data/tickets.json
fi

if [ ! -f "data/unique-ids.json" ]; then
    echo "📝 Génération des IDs uniques..."
    node scripts/generate-unique-ids.js
fi

# Vérifier le fichier .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  Fichier .env.local manquant. Création..."
    cat > .env.local << EOF
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
fi

echo ""
echo "🎉 Tout est prêt !"
echo "📱 L'application sera disponible sur: http://localhost:3000"
echo ""
echo "Pages disponibles :"
echo "  🏠 Page d'accueil:     http://localhost:3000"
echo "  📝 Réservation:        http://localhost:3000/reserve"
echo "  🔍 Vérification:       http://localhost:3000/verify"
echo "  📱 Scanner simple:     http://localhost:3000/scanner-simple.html"
echo ""
echo "🚀 Démarrage du serveur..."

# Démarrer le serveur
npm run dev
