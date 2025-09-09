#!/usr/bin/env node

/**
 * Script pour convertir TOUS les IDs vers le format AIK-XXXXXX
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

// Fonction pour générer un ID unique au format AIK-XXXXXX
function generateUniqueId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'AIK-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function convertAllIds() {
  try {
    log('cyan', '🔄 CONVERSION DE TOUS LES IDs VERS LE FORMAT AIK-XXXXXX');
    log('cyan', '='.repeat(60));
    
    // Lire les données existantes
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    const idsPath = path.join(process.cwd(), 'data', 'unique-ids.json');
    
    let ticketsData = { tickets: [] };
    let idsData = { 
      total_generated: 0, 
      assigned_count: 0, 
      available_count: 0, 
      ids: [] 
    };
    
    // Charger les données existantes si elles existent
    try {
      const existingTickets = await fs.readFile(ticketsPath, 'utf8');
      ticketsData = JSON.parse(existingTickets);
    } catch (error) {
      log('yellow', '⚠️  Fichier tickets.json non trouvé, création d\'un nouveau');
    }
    
    try {
      const existingIds = await fs.readFile(idsPath, 'utf8');
      idsData = JSON.parse(existingIds);
    } catch (error) {
      log('yellow', '⚠️  Fichier unique-ids.json non trouvé, création d\'un nouveau');
    }
    
    log('blue', `📊 État initial:`);
    log('white', `   • Total tickets: ${ticketsData.tickets.length}`);
    log('white', `   • IDs uniques existants: ${idsData.ids.length}`);
    
    // Créer un Set des IDs déjà générés pour éviter les doublons
    const existingUniqueIds = new Set(idsData.ids.map(id => id.id));
    
    // Compter les tickets sans unique_id
    const ticketsWithoutUniqueId = ticketsData.tickets.filter(ticket => !ticket.unique_id);
    log('yellow', `   • Tickets sans unique_id: ${ticketsWithoutUniqueId.length}`);
    
    if (ticketsWithoutUniqueId.length === 0) {
      log('green', '✅ Tous les tickets ont déjà un unique_id !');
      return;
    }
    
    log('cyan', '\n🏭 Génération des nouveaux IDs...');
    
    let generated = 0;
    let assigned = 0;
    
    // Générer et assigner des IDs uniques pour chaque ticket sans unique_id
    for (const ticket of ticketsWithoutUniqueId) {
      // Générer un nouvel ID unique
      let newUniqueId;
      do {
        newUniqueId = generateUniqueId();
      } while (existingUniqueIds.has(newUniqueId));
      
      // Ajouter à la liste des IDs existants
      existingUniqueIds.add(newUniqueId);
      
      // Créer l'objet ID
      const idObj = {
        id: newUniqueId,
        index: idsData.ids.length + generated,
        assigned: true,
        ticket_id: ticket.id,
        created_at: new Date().toISOString(),
        assigned_at: new Date().toISOString()
      };
      
      // Ajouter à la liste des IDs
      idsData.ids.push(idObj);
      
      // Assigner l'unique_id au ticket
      const ticketIndex = ticketsData.tickets.findIndex(t => t.id === ticket.id);
      if (ticketIndex !== -1) {
        ticketsData.tickets[ticketIndex].unique_id = newUniqueId;
        assigned++;
        log('green', `   ✅ ${ticket.id} → ${newUniqueId} (${ticket.name})`);
      }
      
      generated++;
    }
    
    // Générer des IDs supplémentaires pour avoir une réserve
    const additionalIds = 100; // Générer 100 IDs de plus pour l'avenir
    log('blue', `\n🎯 Génération de ${additionalIds} IDs supplémentaires...`);
    
    for (let i = 0; i < additionalIds; i++) {
      let newUniqueId;
      do {
        newUniqueId = generateUniqueId();
      } while (existingUniqueIds.has(newUniqueId));
      
      existingUniqueIds.add(newUniqueId);
      
      const idObj = {
        id: newUniqueId,
        index: idsData.ids.length + i,
        assigned: false,
        ticket_id: null,
        created_at: new Date().toISOString(),
        assigned_at: null
      };
      
      idsData.ids.push(idObj);
    }
    
    // Mettre à jour les compteurs
    idsData.total_generated = idsData.ids.length;
    idsData.assigned_count = idsData.ids.filter(id => id.assigned).length;
    idsData.available_count = idsData.ids.filter(id => !id.assigned).length;
    
    // Sauvegarder les fichiers
    await fs.writeFile(ticketsPath, JSON.stringify(ticketsData, null, 2));
    await fs.writeFile(idsPath, JSON.stringify(idsData, null, 2));
    
    log('magenta', '\n🎉 CONVERSION TERMINÉE !');
    log('cyan', '='.repeat(60));
    log('green', `✅ ${assigned} tickets mis à jour`);
    log('blue', `📈 ${generated + additionalIds} nouveaux IDs générés`);
    log('white', `📊 Total IDs disponibles: ${idsData.total_generated}`);
    log('white', `🎫 IDs assignés: ${idsData.assigned_count}`);
    log('white', `💾 IDs disponibles: ${idsData.available_count}`);
    
    // Vérification finale
    log('cyan', '\n🔍 Vérification finale...');
    const finalTicketsWithoutId = ticketsData.tickets.filter(t => !t.unique_id);
    
    if (finalTicketsWithoutId.length === 0) {
      log('green', '✅ SUCCÈS : Tous les tickets ont maintenant un unique_id !');
    } else {
      log('red', `❌ ERREUR : ${finalTicketsWithoutId.length} tickets sans unique_id`);
      finalTicketsWithoutId.forEach(ticket => {
        log('red', `   • ${ticket.id} (${ticket.name})`);
      });
    }
    
  } catch (error) {
    log('red', `❌ Erreur fatale: ${error.message}`);
    console.error(error);
  }
}

async function showStats() {
  try {
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    const idsPath = path.join(process.cwd(), 'data', 'unique-ids.json');
    
    const ticketsData = JSON.parse(await fs.readFile(ticketsPath, 'utf8'));
    const idsData = JSON.parse(await fs.readFile(idsPath, 'utf8'));
    
    const ticketsWithUniqueId = ticketsData.tickets.filter(t => t.unique_id);
    const checkedInTickets = ticketsWithUniqueId.filter(t => t.checked_in);
    
    log('cyan', '📊 STATISTIQUES ACTUELLES');
    log('cyan', '='.repeat(40));
    log('white', `🎫 Total tickets: ${ticketsData.tickets.length}`);
    log('green', `✅ Avec unique_id: ${ticketsWithUniqueId.length}`);
    log('red', `❌ Sans unique_id: ${ticketsData.tickets.length - ticketsWithUniqueId.length}`);
    log('blue', `🔐 Check-ins effectués: ${checkedInTickets.length}`);
    log('yellow', `⏳ En attente: ${ticketsWithUniqueId.length - checkedInTickets.length}`);
    log('magenta', `🆔 Total IDs générés: ${idsData.total_generated}`);
    log('white', `📦 IDs disponibles: ${idsData.available_count}`);
    
  } catch (error) {
    log('red', `❌ Erreur: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'convert';
  
  if (command === 'convert') {
    await convertAllIds();
  } else if (command === 'stats') {
    await showStats();
  } else {
    log('cyan', 'Usage:');
    log('white', '  node scripts/convert-all-ids.js convert  # Convertir tous les IDs');
    log('white', '  node scripts/convert-all-ids.js stats    # Afficher les statistiques');
  }
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}
