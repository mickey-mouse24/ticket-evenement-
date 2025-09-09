#!/usr/bin/env node

/**
 * Script pour nettoyer la base de données et remettre 500 places disponibles
 * Usage: node clean-database.js
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

async function cleanDatabase() {
  log('magenta', '🗑️  Nettoyage complet de la base de données...\n');
  
  const dataDir = path.join(process.cwd(), 'data');
  const files = [
    { name: 'tickets.json', description: 'Réservations/participants' },
    { name: 'unique-ids.json', description: 'IDs uniques générés' },
    { name: 'places.json', description: 'Gestion des places' }
  ];
  
  // Créer le dossier data s'il n'existe pas
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
    log('blue', `📁 Dossier ${dataDir} créé`);
  }
  
  // Supprimer et recréer chaque fichier
  for (const file of files) {
    const filePath = path.join(dataDir, file.name);
    
    try {
      // Vérifier si le fichier existe
      await fs.access(filePath);
      
      // Lire les données actuelles pour afficher les stats
      const content = await fs.readFile(filePath, 'utf8');
      let stats = '';
      
      try {
        const data = JSON.parse(content);
        if (file.name === 'tickets.json' && data.tickets) {
          stats = ` (${data.tickets.length} participants)`;
        } else if (file.name === 'unique-ids.json' && data.ids) {
          stats = ` (${data.ids.length} IDs générés)`;
        } else if (file.name === 'places.json') {
          stats = ` (${data.reserved || 0} places réservées sur ${data.total || 0})`;
        }
      } catch (e) {
        // Ignore les erreurs de parsing
      }
      
      // Supprimer le fichier
      await fs.unlink(filePath);
      log('red', `   ❌ ${file.description} supprimé${stats}`);
      
    } catch (error) {
      log('yellow', `   ⚠️  ${file.description} n'existe pas`);
    }
  }
  
  log('white', '');
  
  // Recréer les fichiers avec des données par défaut
  log('blue', '🔄 Recréation des fichiers avec données par défaut...\n');
  
  // 1. Fichier tickets.json (vide)
  const ticketsData = {
    tickets: []
  };
  await fs.writeFile(path.join(dataDir, 'tickets.json'), JSON.stringify(ticketsData, null, 2));
  log('green', '   ✅ tickets.json recréé (0 participants)');
  
  // 2. Fichier unique-ids.json (vide)
  const uniqueIdsData = {
    total_generated: 0,
    assigned_count: 0,
    available_count: 0,
    generated_at: new Date().toISOString(),
    ids: []
  };
  await fs.writeFile(path.join(dataDir, 'unique-ids.json'), JSON.stringify(uniqueIdsData, null, 2));
  log('green', '   ✅ unique-ids.json recréé (0 IDs générés)');
  
  // 3. Fichier places.json (500 places disponibles)
  const placesData = {
    total: 500,
    reserved: 0,
    available: 500,
    last_updated: new Date().toISOString()
  };
  await fs.writeFile(path.join(dataDir, 'places.json'), JSON.stringify(placesData, null, 2));
  log('green', '   ✅ places.json recréé (500 places disponibles)');
  
  log('white', '');
}

async function verifyClean() {
  log('cyan', '🔍 Vérification de l\'état de la base...\n');
  
  const dataDir = path.join(process.cwd(), 'data');
  const files = ['tickets.json', 'unique-ids.json', 'places.json'];
  
  for (const fileName of files) {
    const filePath = path.join(dataDir, fileName);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      
      log('blue', `📄 ${fileName}:`);
      
      if (fileName === 'tickets.json') {
        log('white', `   • Participants: ${data.tickets ? data.tickets.length : 0}`);
      } else if (fileName === 'unique-ids.json') {
        log('white', `   • Total IDs: ${data.total_generated || 0}`);
        log('white', `   • IDs assignés: ${data.assigned_count || 0}`);
        log('white', `   • IDs disponibles: ${data.available_count || 0}`);
      } else if (fileName === 'places.json') {
        log('white', `   • Total places: ${data.total || 0}`);
        log('white', `   • Places réservées: ${data.reserved || 0}`);
        log('white', `   • Places disponibles: ${data.available || 0}`);
      }
      log('white', '');
      
    } catch (error) {
      log('red', `❌ Erreur lecture ${fileName}: ${error.message}`);
    }
  }
}

async function testAPI() {
  log('yellow', '🧪 Test rapide de l\'API...\n');
  
  try {
    // Test de l'API places
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync('curl -s http://localhost:3000/api/reservations');
    const result = JSON.parse(stdout);
    
    if (result.success && result.places) {
      log('green', '✅ API opérationnelle');
      log('white', `   • Places disponibles: ${result.places.available}`);
      log('white', `   • Places réservées: ${result.places.reserved}`);
      log('white', `   • Total places: ${result.places.total}`);
    } else {
      log('yellow', '⚠️  API répond mais structure inattendue');
    }
  } catch (error) {
    log('red', '❌ Erreur test API (vérifiez que le serveur Next.js fonctionne)');
  }
  
  log('white', '');
}

async function main() {
  log('magenta', `${colors.bold}🚀 Nettoyage complet de la base de données AI-Karangué${colors.reset}\n`);
  
  try {
    // Étape 1: Nettoyer
    await cleanDatabase();
    
    // Étape 2: Vérifier
    await verifyClean();
    
    // Étape 3: Test API
    await testAPI();
    
    // Résumé final
    log('green', `${colors.bold}🎉 Base de données nettoyée avec succès !${colors.reset}`);
    log('cyan', '\n📊 État final:');
    log('white', '   • 0 participants inscrits');
    log('white', '   • 0 IDs uniques générés');  
    log('white', '   • 500 places disponibles');
    log('white', '   • Système prêt pour de nouvelles inscriptions');
    
    log('blue', '\n💡 Vous pouvez maintenant:');
    log('white', '   • Tester les inscriptions sur http://localhost:3000');
    log('white', '   • Voir le tableau admin sur http://localhost:3000/admin');
    log('white', '   • Utiliser le scanner sur http://localhost:3000/scanner-simple.html');
    
  } catch (error) {
    log('red', `❌ Erreur lors du nettoyage: ${error.message}`);
    process.exit(1);
  }
}

// Démarrage du script
main().catch(error => {
  log('red', `❌ Erreur fatale: ${error.message}`);
  process.exit(1);
});
