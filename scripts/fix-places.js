#!/usr/bin/env node

/**
 * Script pour corriger et synchroniser les places disponibles
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
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function fixPlaces() {
  try {
    log('cyan', '🔧 Correction des places disponibles...');
    
    // Lire les tickets
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    const ticketsData = await fs.readFile(ticketsPath, 'utf8');
    const { tickets } = JSON.parse(ticketsData);
    
    // Compter les tickets
    const totalTickets = tickets.length;
    const checkedInTickets = tickets.filter(t => t.checked_in).length;
    const pendingTickets = totalTickets - checkedInTickets;
    
    log('blue', `📊 Analyse des tickets:`);
    log('white', `   • Total tickets: ${totalTickets}`);
    log('green', `   • Check-ins effectués: ${checkedInTickets}`);
    log('yellow', `   • En attente: ${pendingTickets}`);
    
    // Définir une capacité suffisante
    const newCapacity = Math.max(1000, totalTickets + 100); // Au moins 100 places libres
    const availablePlaces = newCapacity - totalTickets;
    
    // Mettre à jour les places
    const placesPath = path.join(process.cwd(), 'data', 'places.json');
    const placesData = {
      total: newCapacity,
      reserved: totalTickets,
      available: availablePlaces
    };
    
    await fs.writeFile(placesPath, JSON.stringify(placesData, null, 2));
    
    log('green', `✅ Places corrigées:`);
    log('white', `   • Capacité totale: ${newCapacity}`);
    log('white', `   • Places réservées: ${totalTickets}`);
    log('white', `   • Places disponibles: ${availablePlaces}`);
    
    // Vérifier les IDs uniques
    const idsPath = path.join(process.cwd(), 'data', 'unique-ids.json');
    try {
      const idsData = await fs.readFile(idsPath, 'utf8');
      const uniqueIds = JSON.parse(idsData);
      
      log('blue', `\n🆔 IDs uniques:`);
      log('white', `   • Total générés: ${uniqueIds.total_generated}`);
      log('white', `   • Assignés: ${uniqueIds.assigned_count}`);
      log('white', `   • Disponibles: ${uniqueIds.available_count}`);
      
      // Compter les tickets avec unique_id
      const ticketsWithUniqueId = tickets.filter(t => t.unique_id).length;
      log('white', `   • Tickets avec ID unique: ${ticketsWithUniqueId}`);
      
    } catch (error) {
      log('yellow', '⚠️  Fichier unique-ids.json non trouvé');
    }
    
    log('magenta', '\n🎉 Correction terminée !');
    log('green', 'Vous pouvez maintenant créer de nouveaux tickets.');
    
  } catch (error) {
    log('red', `❌ Erreur: ${error.message}`);
  }
}

async function testReservation() {
  log('cyan', '\n🧪 Test de création de réservation...');
  
  try {
    const response = await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Places Disponibles',
        email: 'test.places@aikarangue.sn',
        phone: '+221 77 999 88 77',
        company: 'Test Company',
        fonction: 'Testeur Places'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        log('green', '✅ Réservation test créée avec succès !');
        log('white', `   ID: ${data.reservation.id}`);
        if (data.reservation.unique_id) {
          log('white', `   ID Unique: ${data.reservation.unique_id}`);
        }
      } else {
        log('red', `❌ Erreur réservation: ${data.message}`);
      }
    } else {
      log('red', `❌ Erreur HTTP: ${response.status}`);
    }
  } catch (error) {
    log('red', `❌ Erreur test: ${error.message}`);
    log('yellow', '💡 Assurez-vous que le serveur est démarré avec: npm run dev');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'fix';
  
  if (command === 'fix') {
    await fixPlaces();
  } else if (command === 'test') {
    await testReservation();
  } else if (command === 'both') {
    await fixPlaces();
    await testReservation();
  } else {
    log('cyan', 'Usage:');
    log('white', '  node scripts/fix-places.js fix   # Corriger les places');
    log('white', '  node scripts/fix-places.js test  # Tester une réservation');
    log('white', '  node scripts/fix-places.js both  # Corriger puis tester');
  }
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}
