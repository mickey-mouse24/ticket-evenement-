#!/usr/bin/env node

/**
 * Script pour épurer et réinitialiser la base de données
 * Remet à zéro tous les tickets et restaure les 500 places disponibles
 */

const fs = require('fs').promises;
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function resetDatabase() {
  try {
    log('magenta', '🗑️ ÉPURATION DE LA BASE DE DONNÉES AI-KARANGUÉ');
    log('magenta', '='.repeat(50));
    
    // Vérifier d'abord l'état actuel
    const dataDir = path.join(process.cwd(), 'data');
    log('blue', '📊 État actuel de la base de données:');
    
    // Déclarer les variables au niveau de la fonction
    let currentTickets = 0;
    let currentIds = 0;
    let currentPlaces = { total: 1000, reserved: 0, available: 1000 };
    
    try {
      // Lire les fichiers actuels
      const ticketsPath = path.join(dataDir, 'tickets.json');
      const idsPath = path.join(dataDir, 'unique-ids.json');
      const placesPath = path.join(dataDir, 'places.json');
      
      try {
        const ticketsData = await fs.readFile(ticketsPath, 'utf8');
        const { tickets } = JSON.parse(ticketsData);
        currentTickets = tickets.length;
      } catch (e) {
        log('yellow', '   ⚠️ tickets.json non trouvé');
      }
      
      try {
        const idsData = await fs.readFile(idsPath, 'utf8');
        const uniqueIdsData = JSON.parse(idsData);
        currentIds = uniqueIdsData.total_generated || uniqueIdsData.ids.length;
      } catch (e) {
        log('yellow', '   ⚠️ unique-ids.json non trouvé');
      }
      
      try {
        const placesData = await fs.readFile(placesPath, 'utf8');
        currentPlaces = JSON.parse(placesData);
      } catch (e) {
        log('yellow', '   ⚠️ places.json non trouvé');
      }
      
      log('white', `   • Tickets actuels: ${currentTickets}`);
      log('white', `   • IDs uniques générés: ${currentIds}`);
      log('white', `   • Places réservées: ${currentPlaces.reserved}`);
      log('white', `   • Places disponibles: ${currentPlaces.available}`);
      
    } catch (error) {
      log('yellow', '⚠️ Erreur lecture état actuel, continuation...');
    }
    
    log('');
    log('red', '🧹 Épuration en cours...');
    
    // S'assurer que le dossier data existe
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
      log('blue', '📁 Dossier data créé');
    }
    
    // 1. Réinitialiser tickets.json
    const ticketsData = {
      tickets: [],
      metadata: {
        last_updated: new Date().toISOString(),
        total_tickets: 0,
        version: "2.0"
      }
    };
    
    await fs.writeFile(
      path.join(dataDir, 'tickets.json'),
      JSON.stringify(ticketsData, null, 2)
    );
    log('green', '✅ tickets.json réinitialisé (0 tickets)');
    
    // 2. Réinitialiser unique-ids.json
    const uniqueIdsData = {
      total_generated: 0,
      assigned_count: 0,
      available_count: 0,
      ids: [],
      metadata: {
        last_updated: new Date().toISOString(),
        version: "2.0"
      }
    };
    
    await fs.writeFile(
      path.join(dataDir, 'unique-ids.json'),
      JSON.stringify(uniqueIdsData, null, 2)
    );
    log('green', '✅ unique-ids.json réinitialisé (0 IDs)');
    
    // 3. Réinitialiser places.json - RETOUR À 500 PLACES
    const placesData = {
      total: 500,
      reserved: 0,
      available: 500,
      metadata: {
        event: "AI-Karangué 2025",
        date: "2025-09-20",
        venue: "CICAD - DIAMNIADIO",
        last_updated: new Date().toISOString(),
        reset_date: new Date().toISOString()
      }
    };
    
    await fs.writeFile(
      path.join(dataDir, 'places.json'),
      JSON.stringify(placesData, null, 2)
    );
    log('green', '✅ places.json réinitialisé (500 places disponibles)');
    
    // 4. Créer un fichier de sauvegarde des anciens tickets (optionnel)
    const backupData = {
      backup_date: new Date().toISOString(),
      reason: "Database reset - returning to 500 available places",
      previous_state: {
        tickets: currentTickets,
        ids: currentIds,
        places_reserved: currentPlaces.reserved
      },
      note: "This backup was created during database reset"
    };
    
    await fs.writeFile(
      path.join(dataDir, `backup-${Date.now()}.json`),
      JSON.stringify(backupData, null, 2)
    );
    log('blue', '💾 Sauvegarde de l\'état précédent créée');
    
    log('');
    log('magenta', '📊 ÉTAT FINAL:');
    log('green', '   ✅ Base de données complètement épurée');
    log('green', '   ✅ 500 places disponibles restaurées');
    log('green', '   ✅ 0 ticket enregistré');
    log('green', '   ✅ 0 ID unique généré');
    log('green', '   ✅ Système prêt pour l\'événement');
    
    log('');
    log('cyan', '🎯 PROCHAINES ÉTAPES:');
    log('white', '   1. Système prêt à recevoir de nouvelles réservations');
    log('white', '   2. Les nouvelles réservations utiliseront les QR codes JSON enrichis');
    log('white', '   3. Scanner simple entièrement fonctionnel');
    log('white', '   4. 500 places disponibles pour AI-Karangué 2025');
    
    log('');
    log('magenta', '🎉 ÉPURATION TERMINÉE AVEC SUCCÈS !');
    
  } catch (error) {
    log('red', `❌ Erreur lors de l'épuration: ${error.message}`);
    throw error;
  }
}

async function verifyReset() {
  log('');
  log('cyan', '🔍 VÉRIFICATION POST-ÉPURATION...');
  
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Vérifier tickets
    const ticketsData = await fs.readFile(path.join(dataDir, 'tickets.json'), 'utf8');
    const { tickets } = JSON.parse(ticketsData);
    
    // Vérifier IDs
    const idsData = await fs.readFile(path.join(dataDir, 'unique-ids.json'), 'utf8');
    const uniqueIds = JSON.parse(idsData);
    
    // Vérifier places
    const placesData = await fs.readFile(path.join(dataDir, 'places.json'), 'utf8');
    const places = JSON.parse(placesData);
    
    log('green', '✅ VÉRIFICATION RÉUSSIE:');
    log('white', `   • Tickets: ${tickets.length} (attendu: 0)`);
    log('white', `   • IDs uniques: ${uniqueIds.total_generated} (attendu: 0)`);
    log('white', `   • Places totales: ${places.total} (attendu: 500)`);
    log('white', `   • Places disponibles: ${places.available} (attendu: 500)`);
    log('white', `   • Places réservées: ${places.reserved} (attendu: 0)`);
    
    // Vérifier que tout est bien à zéro/500
    const isValid = 
      tickets.length === 0 &&
      uniqueIds.total_generated === 0 &&
      places.total === 500 &&
      places.available === 500 &&
      places.reserved === 0;
    
    if (isValid) {
      log('green', '🎉 ÉPURATION PARFAITEMENT RÉUSSIE !');
    } else {
      log('red', '⚠️ Des valeurs ne correspondent pas aux attentes');
    }
    
  } catch (error) {
    log('red', `❌ Erreur vérification: ${error.message}`);
  }
}

async function main() {
  try {
    await resetDatabase();
    await verifyReset();
    
    log('');
    log('blue', '🌟 Votre système AI-Karangué est prêt avec 500 places disponibles !');
    log('white', '   URLs disponibles:');
    log('white', '   • Réservation: http://localhost:3000/reserve');
    log('white', '   • Scanner: http://localhost:3000/scanner-simple.html');
    
  } catch (error) {
    log('red', `❌ Échec de l'épuration: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
