#!/usr/bin/env node

/**
 * Script de test pour créer une réservation quand la base est vide
 * Usage: node test-empty-db-reservation.js
 */

const fs = require('fs').promises;
const path = require('path');

// Couleurs pour le terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function clearDatabase() {
  log('yellow', '🗑️  Nettoyage de la base de données...');
  
  const dataDir = path.join(process.cwd(), 'data');
  const files = ['tickets.json', 'unique-ids.json', 'places.json'];
  
  // Créer le dossier data s'il n'existe pas
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
    log('blue', `📁 Dossier ${dataDir} créé`);
  }
  
  // Supprimer les fichiers existants
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      await fs.unlink(filePath);
      log('green', `   ✅ ${file} supprimé`);
    } catch (error) {
      log('yellow', `   ⚠️  ${file} n'existe pas (normal)`);
    }
  }
  
  // Créer le fichier places.json avec des données par défaut
  const placesData = {
    total: 500,
    reserved: 0,
    available: 500
  };
  
  const placesPath = path.join(dataDir, 'places.json');
  await fs.writeFile(placesPath, JSON.stringify(placesData, null, 2));
  log('green', '   ✅ places.json créé avec 500 places disponibles');
  
  log('green', '✅ Base de données nettoyée');
}

async function testReservation() {
  log('cyan', '🧪 Test de création de réservation avec base vide...');
  
  const testData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123456789',
    company: 'Test Company',
    fonction: 'Développeur'
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      log('green', '✅ Réservation créée avec succès !');
      log('white', `   • Nom: ${result.reservation.name}`);
      log('white', `   • Email: ${result.reservation.email}`);
      log('white', `   • ID unique: ${result.reservation.unique_id}`);
      log('white', `   • QR code: ${result.reservation.qrcode}`);
      log('white', `   • Places restantes: ${result.placesRestantes}`);
      
      // Vérifier si le QR code contient du JSON
      if (result.qr) {
        log('cyan', '🎫 QR code généré avec succès');
      }
      
      return true;
    } else {
      log('red', '❌ Erreur lors de la création:');
      log('red', `   ${result.message}`);
      return false;
    }
  } catch (error) {
    log('red', '❌ Erreur de connexion:');
    log('red', `   ${error.message}`);
    log('yellow', '💡 Assurez-vous que le serveur Next.js est démarré avec "npm run dev"');
    return false;
  }
}

async function verifyFiles() {
  log('blue', '📋 Vérification des fichiers générés...');
  
  const dataDir = path.join(process.cwd(), 'data');
  const files = ['tickets.json', 'places.json'];
  
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      
      log('green', `✅ ${file}:`);
      if (file === 'tickets.json') {
        log('white', `   • Tickets: ${data.tickets ? data.tickets.length : 0}`);
      } else if (file === 'places.json') {
        log('white', `   • Total: ${data.total}`);
        log('white', `   • Réservées: ${data.reserved}`);
        log('white', `   • Disponibles: ${data.available}`);
      }
    } catch (error) {
      log('red', `❌ Erreur lecture ${file}: ${error.message}`);
    }
  }
}

async function main() {
  log('magenta', '🚀 Test de création de réservation avec base vide\n');
  
  // Étape 1: Nettoyer la base
  await clearDatabase();
  log('white', '');
  
  // Étape 2: Tester la création de réservation
  const success = await testReservation();
  log('white', '');
  
  if (success) {
    // Étape 3: Vérifier les fichiers créés
    await verifyFiles();
    log('white', '');
    
    log('green', '🎉 Test réussi ! Le problème "Aucun ID unique disponible" est corrigé.');
    log('cyan', 'ℹ️  Les IDs uniques sont maintenant générés dynamiquement quand la base est vide.');
  } else {
    log('red', '💥 Test échoué !');
    process.exit(1);
  }
}

// Démarrage du script
main().catch(error => {
  log('red', `❌ Erreur fatale: ${error.message}`);
  process.exit(1);
});
