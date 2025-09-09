#!/usr/bin/env node

/**
 * Script pour corriger les IDs uniques des tickets
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

async function fixTicketIds() {
  try {
    log('cyan', '🔧 Correction des IDs uniques des tickets...');
    
    // Lire les données
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    const idsPath = path.join(process.cwd(), 'data', 'unique-ids.json');
    
    const ticketsData = JSON.parse(await fs.readFile(ticketsPath, 'utf8'));
    const idsData = JSON.parse(await fs.readFile(idsPath, 'utf8'));
    
    log('blue', `📊 Analyse:`);
    log('white', `   • Total tickets: ${ticketsData.tickets.length}`);
    log('white', `   • IDs uniques générés: ${idsData.ids.length}`);
    
    // Créer un mapping ticket_id -> unique_id
    const ticketIdToUniqueId = {};
    idsData.ids.forEach(idObj => {
      if (idObj.assigned && idObj.ticket_id) {
        ticketIdToUniqueId[idObj.ticket_id] = idObj.id;
      }
    });
    
    log('white', `   • Mappings trouvés: ${Object.keys(ticketIdToUniqueId).length}`);
    
    // Corriger les tickets
    let corrected = 0;
    let alreadyCorrect = 0;
    
    ticketsData.tickets.forEach((ticket, index) => {
      const uniqueId = ticketIdToUniqueId[ticket.id];
      
      if (uniqueId) {
        if (!ticket.unique_id) {
          // Ajouter l'unique_id manquant
          ticketsData.tickets[index].unique_id = uniqueId;
          corrected++;
          log('green', `   ✅ ${ticket.id} → ${uniqueId}`);
        } else if (ticket.unique_id !== uniqueId) {
          // Corriger l'unique_id incorrect
          log('yellow', `   🔄 ${ticket.id}: ${ticket.unique_id} → ${uniqueId}`);
          ticketsData.tickets[index].unique_id = uniqueId;
          corrected++;
        } else {
          alreadyCorrect++;
        }
      }
    });
    
    log('blue', `\n📈 Résultats:`);
    log('green', `   • Tickets corrigés: ${corrected}`);
    log('white', `   • Déjà corrects: ${alreadyCorrect}`);
    
    // Sauvegarder
    await fs.writeFile(ticketsPath, JSON.stringify(ticketsData, null, 2));
    
    log('magenta', '\n🎉 Correction terminée !');
    
    // Vérifier le ticket spécifique
    const specificTicket = ticketsData.tickets.find(t => t.id === 'ej3g16zc1');
    if (specificTicket) {
      log('cyan', `\n🎫 Ticket ej3g16zc1:`);
      log('white', `   • Nom: ${specificTicket.name}`);
      log('white', `   • Email: ${specificTicket.email}`);
      log('white', `   • ID Unique: ${specificTicket.unique_id || 'MANQUANT'}`);
      log('white', `   • QR Code: ${specificTicket.qrcode}`);
      log('white', `   • Check-in: ${specificTicket.checked_in ? 'Oui' : 'Non'}`);
    }
    
  } catch (error) {
    log('red', `❌ Erreur: ${error.message}`);
  }
}

async function testSpecificId(ticketId) {
  try {
    log('cyan', `\n🧪 Test du ticket: ${ticketId}`);
    
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    const ticketsData = JSON.parse(await fs.readFile(ticketsPath, 'utf8'));
    
    const ticket = ticketsData.tickets.find(t => t.id === ticketId);
    
    if (!ticket) {
      log('red', `❌ Ticket ${ticketId} non trouvé`);
      return;
    }
    
    if (!ticket.unique_id) {
      log('red', `❌ Ticket ${ticketId} n'a pas d'unique_id`);
      return;
    }
    
    // Test de vérification
    log('blue', `🔍 Test de vérification avec l'ID: ${ticket.unique_id}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/verify-unique-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uniqueId: ticket.unique_id,
          action: 'verify'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        log('green', `✅ ID ${ticket.unique_id} valide !`);
        log('white', `   • Statut: ${result.status}`);
        log('white', `   • Message: ${result.message}`);
      } else {
        log('red', `❌ ID ${ticket.unique_id} invalide`);
        log('white', `   • Statut: ${result.status}`);
        log('white', `   • Message: ${result.message}`);
      }
      
    } catch (fetchError) {
      log('yellow', '⚠️  Serveur non accessible pour le test API');
    }
    
  } catch (error) {
    log('red', `❌ Erreur test: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'fix';
  
  if (command === 'fix') {
    await fixTicketIds();
  } else if (command === 'test') {
    const ticketId = args[1] || 'ej3g16zc1';
    await testSpecificId(ticketId);
  } else if (command === 'both') {
    await fixTicketIds();
    await testSpecificId('ej3g16zc1');
  } else {
    log('cyan', 'Usage:');
    log('white', '  node scripts/fix-ticket-ids.js fix        # Corriger les IDs');
    log('white', '  node scripts/fix-ticket-ids.js test [id]  # Tester un ticket');
    log('white', '  node scripts/fix-ticket-ids.js both       # Corriger puis tester');
  }
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}
