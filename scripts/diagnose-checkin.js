#!/usr/bin/env node

/**
 * Script pour diagnostiquer le problème de check-in
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

async function analyzeData() {
  try {
    log('cyan', '🔍 DIAGNOSTIC DU PROBLÈME DE CHECK-IN');
    log('cyan', '='.repeat(45));
    
    // Lire les tickets
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    const ticketsData = await fs.readFile(ticketsPath, 'utf8');
    const { tickets } = JSON.parse(ticketsData);
    
    log('blue', `📊 Analyse des tickets (${tickets.length} tickets):`);
    
    let ticketsWithUniqueId = 0;
    let ticketsWithoutUniqueId = 0;
    let recentTickets = [];
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    tickets.forEach((ticket, index) => {
      const createdAt = new Date(ticket.created_at);
      
      if (ticket.unique_id) {
        ticketsWithUniqueId++;
        if (createdAt > oneHourAgo) {
          recentTickets.push({
            index,
            id: ticket.id,
            unique_id: ticket.unique_id,
            name: ticket.name,
            created_at: ticket.created_at,
            checked_in: ticket.checked_in
          });
        }
      } else {
        ticketsWithoutUniqueId++;
      }
    });
    
    log('white', `   • Avec unique_id: ${ticketsWithUniqueId}`);
    log('white', `   • Sans unique_id: ${ticketsWithoutUniqueId}`);
    log('white', `   • Créés récemment: ${recentTickets.length}`);
    
    if (recentTickets.length > 0) {
      log('green', '\n📋 Tickets récents (dernière heure):');
      recentTickets.forEach(ticket => {
        log('white', `   • ${ticket.unique_id} - ${ticket.name}`);
        log('white', `     ID interne: ${ticket.id}`);
        log('white', `     Check-in: ${ticket.checked_in ? '✅' : '⏳'}`);
      });
    }
    
    // Lire les IDs uniques
    const idsPath = path.join(process.cwd(), 'data', 'unique-ids.json');
    const idsData = await fs.readFile(idsPath, 'utf8');
    const uniqueIdsData = JSON.parse(idsData);
    
    log('blue', `\n🔑 Analyse des IDs uniques (${uniqueIdsData.ids.length} IDs):`);
    log('white', `   • Total générés: ${uniqueIdsData.total_generated}`);
    log('white', `   • Assignés: ${uniqueIdsData.assigned_count}`);
    log('white', `   • Disponibles: ${uniqueIdsData.available_count}`);
    
    // Vérifier la cohérence
    log('yellow', '\n🔍 Vérification de cohérence:');
    let inconsistencies = 0;
    
    for (const ticket of tickets) {
      if (ticket.unique_id) {
        const idObj = uniqueIdsData.ids.find(id => id.id === ticket.unique_id);
        if (!idObj) {
          log('red', `   ❌ Ticket ${ticket.unique_id} n'existe pas dans unique-ids.json`);
          inconsistencies++;
        } else if (!idObj.assigned || idObj.ticket_id !== ticket.id) {
          log('red', `   ❌ Ticket ${ticket.unique_id} mal assigné`);
          log('white', `      • assigned: ${idObj.assigned}`);
          log('white', `      • ticket_id attendu: ${ticket.id}, actuel: ${idObj.ticket_id}`);
          inconsistencies++;
        }
      }
    }
    
    if (inconsistencies === 0) {
      log('green', '   ✅ Aucune incohérence détectée');
    } else {
      log('red', `   ❌ ${inconsistencies} incohérence(s) détectée(s)`);
    }
    
    return recentTickets[0]; // Retourner le ticket le plus récent pour les tests
    
  } catch (error) {
    log('red', `❌ Erreur: ${error.message}`);
    return null;
  }
}

async function testSpecificId(uniqueId) {
  if (!uniqueId) {
    log('yellow', '⚠️ Aucun ID à tester');
    return;
  }
  
  log('cyan', `\n🧪 TEST SPÉCIFIQUE POUR: ${uniqueId}`);
  log('cyan', '='.repeat(35));
  
  try {
    // Test avec ID simple
    log('blue', '1. Test avec ID simple:');
    let response = await fetch('http://localhost:3000/api/verify-unique-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uniqueId: uniqueId,
        action: 'verify'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      log('white', `   Résultat: ${result.success ? '✅' : '❌'} ${result.message}`);
    } else {
      log('red', `   ❌ Erreur HTTP: ${response.status}`);
    }
    
    // Test avec JSON
    log('blue', '\n2. Test avec JSON:');
    const jsonData = JSON.stringify({
      id: uniqueId,
      name: 'Test Check-in',
      event: 'AI-Karangué 2025'
    });
    
    response = await fetch('http://localhost:3000/api/verify-unique-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uniqueId: jsonData,
        action: 'verify'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      log('white', `   Résultat: ${result.success ? '✅' : '❌'} ${result.message}`);
      if (result.id) {
        log('white', `   ID extrait: ${result.id}`);
      }
    } else {
      log('red', `   ❌ Erreur HTTP: ${response.status}`);
    }
    
  } catch (error) {
    log('red', `❌ Erreur test: ${error.message}`);
    log('yellow', '💡 Le serveur n\'est probablement pas démarré. Utilisez: npm run dev');
  }
}

async function main() {
  const recentTicket = await analyzeData();
  
  log('');
  log('magenta', '🎯 RECOMMANDATIONS:');
  
  if (recentTicket) {
    log('white', `1. Testez avec l'ID récent: ${recentTicket.unique_id}`);
    log('white', '2. Assurez-vous que le serveur est démarré: npm run dev');
    log('white', '3. Utilisez l\'interface: http://localhost:3000/scanner-ids.html');
    
    // Tester si le serveur est accessible
    try {
      await testSpecificId(recentTicket.unique_id);
    } catch (error) {
      log('yellow', '\n💡 Démarrez le serveur et retestez');
    }
  } else {
    log('white', '1. Créez un nouveau ticket pour tester');
    log('white', '2. Utilisez: http://localhost:3000/reserve');
  }
  
  log('');
  log('green', '✨ Diagnostic terminé !');
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}
