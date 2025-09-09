#!/usr/bin/env node

/**
 * Script pour générer 600 IDs uniques pour les tickets AI-Karangué
 * Usage: node scripts/generate-unique-ids.js
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const IDS_FILE = path.join(process.cwd(), 'data', 'unique-ids.json');
const TICKETS_PATH = path.join(process.cwd(), 'data', 'tickets.json');

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

// Générer un ID unique au format AIK-XXXXXX (6 caractères)
function generateUniqueId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'AIK-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Générer 600 IDs uniques
async function generateIds(count = 600) {
  log('cyan', `🚀 Génération de ${count} IDs uniques pour AI-Karangué...`);
  
  const ids = new Set();
  const maxAttempts = count * 10; // Éviter les boucles infinies
  let attempts = 0;
  
  while (ids.size < count && attempts < maxAttempts) {
    const id = generateUniqueId();
    ids.add(id);
    attempts++;
    
    if (ids.size % 50 === 0) {
      log('green', `   ✅ ${ids.size}/${count} IDs générés`);
    }
  }
  
  if (ids.size < count) {
    log('yellow', `⚠️  Seulement ${ids.size} IDs uniques générés sur ${count} demandés`);
  }
  
  const uniqueIds = Array.from(ids).map((id, index) => ({
    id: id,
    index: index + 1,
    assigned: false,
    ticket_id: null,
    created_at: new Date().toISOString(),
    assigned_at: null
  }));
  
  // Créer le dossier data s'il n'existe pas
  const dataDir = path.dirname(IDS_FILE);
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
    log('blue', `📁 Dossier ${dataDir} créé`);
  }
  
  // Sauvegarder les IDs
  const data = {
    total_generated: uniqueIds.length,
    assigned_count: 0,
    available_count: uniqueIds.length,
    generated_at: new Date().toISOString(),
    ids: uniqueIds
  };
  
  await fs.writeFile(IDS_FILE, JSON.stringify(data, null, 2));
  
  log('magenta', `\n🎉 Génération terminée !`);
  log('cyan', `\n📊 Résumé:`);
  log('white', `   • Total IDs générés: ${uniqueIds.length}`);
  log('white', `   • Format: AIK-XXXXXX`);
  log('white', `   • Fichier: ${IDS_FILE}`);
  
  log('yellow', `\n💡 Exemples d'IDs générés:`);
  uniqueIds.slice(0, 10).forEach((item, index) => {
    log('green', `   ${index + 1}. ${item.id}`);
  });
  
  if (uniqueIds.length > 10) {
    log('white', `   ... et ${uniqueIds.length - 10} autres`);
  }
  
  log('yellow', `\n💡 Pour assigner un ID à un ticket:`);
  log('green', `   Le système assignera automatiquement lors de la création de tickets`);
  
  return uniqueIds;
}

// Obtenir le prochain ID disponible
async function getNextAvailableId() {
  try {
    const data = await fs.readFile(IDS_FILE, 'utf8');
    const idsData = JSON.parse(data);
    
    const availableId = idsData.ids.find(item => !item.assigned);
    return availableId ? availableId.id : null;
  } catch (error) {
    log('red', `Erreur lecture IDs: ${error.message}`);
    return null;
  }
}

// Assigner un ID à un ticket
async function assignIdToTicket(ticketId) {
  try {
    const data = await fs.readFile(IDS_FILE, 'utf8');
    const idsData = JSON.parse(data);
    
    const availableIndex = idsData.ids.findIndex(item => !item.assigned);
    
    if (availableIndex === -1) {
      log('red', '❌ Aucun ID disponible');
      return null;
    }
    
    // Assigner l'ID
    idsData.ids[availableIndex].assigned = true;
    idsData.ids[availableIndex].ticket_id = ticketId;
    idsData.ids[availableIndex].assigned_at = new Date().toISOString();
    
    // Mettre à jour les compteurs
    idsData.assigned_count = idsData.ids.filter(item => item.assigned).length;
    idsData.available_count = idsData.ids.filter(item => !item.assigned).length;
    
    // Sauvegarder
    await fs.writeFile(IDS_FILE, JSON.stringify(idsData, null, 2));
    
    const assignedId = idsData.ids[availableIndex].id;
    log('green', `✅ ID ${assignedId} assigné au ticket ${ticketId}`);
    
    return assignedId;
  } catch (error) {
    log('red', `Erreur assignation ID: ${error.message}`);
    return null;
  }
}

// Vérifier si un ID est valide
async function isValidId(id) {
  try {
    const data = await fs.readFile(IDS_FILE, 'utf8');
    const idsData = JSON.parse(data);
    
    const foundId = idsData.ids.find(item => item.id === id);
    return foundId ? foundId : null;
  } catch (error) {
    log('red', `Erreur vérification ID: ${error.message}`);
    return null;
  }
}

// Afficher les statistiques
async function showStats() {
  try {
    const data = await fs.readFile(IDS_FILE, 'utf8');
    const idsData = JSON.parse(data);
    
    log('magenta', '\n📊 Statistiques des IDs');
    log('white', `   • Total généré: ${idsData.total_generated}`);
    log('green', `   • Assignés: ${idsData.assigned_count}`);
    log('yellow', `   • Disponibles: ${idsData.available_count}`);
    log('blue', `   • Taux d'utilisation: ${((idsData.assigned_count / idsData.total_generated) * 100).toFixed(1)}%`);
    log('white', `   • Généré le: ${new Date(idsData.generated_at).toLocaleString('fr-FR')}`);
    
    return idsData;
  } catch (error) {
    log('red', `Erreur stats: ${error.message}`);
    return null;
  }
}

// Lister quelques IDs assignés
async function showAssignedIds(count = 10) {
  try {
    const data = await fs.readFile(IDS_FILE, 'utf8');
    const idsData = JSON.parse(data);
    
    const assignedIds = idsData.ids.filter(item => item.assigned).slice(0, count);
    
    if (assignedIds.length > 0) {
      log('cyan', `\n🎫 IDs Assignés (${Math.min(count, assignedIds.length)} sur ${idsData.assigned_count}):`);
      assignedIds.forEach((item, index) => {
        log('green', `   ${index + 1}. ${item.id} → Ticket ${item.ticket_id}`);
        log('white', `      Assigné le: ${new Date(item.assigned_at).toLocaleString('fr-FR')}`);
      });
    } else {
      log('yellow', '\n🎫 Aucun ID assigné pour le moment');
    }
  } catch (error) {
    log('red', `Erreur lecture IDs assignés: ${error.message}`);
  }
}

// Lister quelques IDs disponibles
async function showAvailableIds(count = 10) {
  try {
    const data = await fs.readFile(IDS_FILE, 'utf8');
    const idsData = JSON.parse(data);
    
    const availableIds = idsData.ids.filter(item => !item.assigned).slice(0, count);
    
    if (availableIds.length > 0) {
      log('cyan', `\n🆓 IDs Disponibles (${Math.min(count, availableIds.length)} sur ${idsData.available_count}):`);
      availableIds.forEach((item, index) => {
        log('green', `   ${index + 1}. ${item.id}`);
      });
    } else {
      log('red', '\n🆓 Aucun ID disponible !');
    }
  } catch (error) {
    log('red', `Erreur lecture IDs disponibles: ${error.message}`);
  }
}

function showHelp() {
  log('cyan', '🔧 Générateur d\'IDs uniques AI-Karangué\n');
  
  log('yellow', 'Commandes:');
  log('white', '  generate [nombre]    - Générer des IDs (défaut: 600)');
  log('white', '  stats                - Afficher les statistiques');
  log('white', '  assigned [nombre]    - Voir les IDs assignés (défaut: 10)');
  log('white', '  available [nombre]   - Voir les IDs disponibles (défaut: 10)');
  log('white', '  verify [ID]          - Vérifier si un ID est valide');
  log('white', '  help                 - Afficher cette aide');
  
  log('green', '\nExemples:');
  log('white', '  node scripts/generate-unique-ids.js generate 600');
  log('white', '  node scripts/generate-unique-ids.js stats');
  log('white', '  node scripts/generate-unique-ids.js verify AIK-ABC123');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';
  
  switch (command.toLowerCase()) {
    case 'generate':
      const count = parseInt(args[1]) || 600;
      await generateIds(count);
      break;
      
    case 'stats':
      await showStats();
      break;
      
    case 'assigned':
      const assignedCount = parseInt(args[1]) || 10;
      await showAssignedIds(assignedCount);
      break;
      
    case 'available':
      const availableCount = parseInt(args[1]) || 10;
      await showAvailableIds(availableCount);
      break;
      
    case 'verify':
      if (!args[1]) {
        log('red', 'Usage: verify [ID]');
        return;
      }
      const result = await isValidId(args[1]);
      if (result) {
        log('green', `✅ ID ${args[1]} est valide`);
        log('white', `   Assigné: ${result.assigned ? 'Oui' : 'Non'}`);
        if (result.assigned) {
          log('white', `   Ticket: ${result.ticket_id}`);
          log('white', `   Assigné le: ${new Date(result.assigned_at).toLocaleString('fr-FR')}`);
        }
      } else {
        log('red', `❌ ID ${args[1]} non trouvé`);
      }
      break;
      
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Démarrage du script
if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { 
  generateIds, 
  getNextAvailableId, 
  assignIdToTicket, 
  isValidId, 
  showStats 
};
