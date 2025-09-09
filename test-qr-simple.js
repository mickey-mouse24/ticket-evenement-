#!/usr/bin/env node

/**
 * Script de test simple avec curl pour les QR codes
 * Usage: node test-qr-simple.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

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

async function getLatestTicket() {
  const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
  try {
    const content = await fs.readFile(ticketsPath, 'utf8');
    const data = JSON.parse(content);
    
    if (data.tickets && data.tickets.length > 0) {
      return data.tickets[data.tickets.length - 1];
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function curlRequest(method, url, data = null) {
  try {
    let cmd = `curl -s -X ${method} ${url}`;
    
    if (data) {
      cmd += ` -H "Content-Type: application/json" -d '${JSON.stringify(data)}'`;
    }
    
    const { stdout } = await execAsync(cmd);
    return JSON.parse(stdout);
  } catch (error) {
    log('red', `Erreur curl: ${error.message}`);
    return null;
  }
}

async function main() {
  log('magenta', '🚀 Test simple des QR codes avec curl\n');
  
  // Obtenir le dernier ticket
  const ticket = await getLatestTicket();
  if (!ticket) {
    log('red', '❌ Aucun ticket trouvé');
    return;
  }
  
  log('blue', `🎫 Ticket trouvé: ${ticket.unique_id} - ${ticket.name}`);
  
  // Test 1: Vérification simple
  log('cyan', '\n🔍 Test 1: Vérification simple');
  const verifyResult = await curlRequest(
    'POST', 
    'http://localhost:3000/api/verify-unique-id',
    { uniqueId: ticket.unique_id, action: 'verify' }
  );
  
  if (verifyResult && verifyResult.success) {
    log('green', '✅ Vérification réussie');
    log('white', `   • Status: ${verifyResult.status}`);
    log('white', `   • Message: ${verifyResult.message}`);
  } else {
    log('red', '❌ Vérification échouée');
    if (verifyResult) log('red', `   • ${verifyResult.message}`);
  }
  
  // Test 2: QR code JSON
  log('cyan', '\n🎫 Test 2: QR code JSON');
  const qrData = {
    id: ticket.unique_id,
    ticketId: ticket.id,
    name: ticket.name,
    email: ticket.email,
    phone: ticket.phone,
    company: ticket.company,
    fonction: ticket.fonction,
    event: 'AI-Karangué 2025',
    date: '2025-09-20',
    venue: 'CICAD - DIAMNIADIO',
    timestamp: new Date().toISOString()
  };
  
  const qrJsonString = JSON.stringify(qrData);
  log('yellow', 'QR JSON créé avec succès');
  
  const jsonVerifyResult = await curlRequest(
    'POST',
    'http://localhost:3000/api/verify-unique-id',
    { uniqueId: qrJsonString, action: 'verify' }
  );
  
  if (jsonVerifyResult && jsonVerifyResult.success) {
    log('green', '✅ Vérification JSON réussie');
    log('white', `   • Status: ${jsonVerifyResult.status}`);
    log('white', `   • ID extrait: ${jsonVerifyResult.id}`);
    log('white', `   • Participant: ${jsonVerifyResult.ticket.name}`);
  } else {
    log('red', '❌ Vérification JSON échouée');
    if (jsonVerifyResult) log('red', `   • ${jsonVerifyResult.message}`);
  }
  
  // Test 3: Check-in si pas déjà fait
  if (!ticket.checked_in) {
    log('cyan', '\n📝 Test 3: Check-in');
    const checkinResult = await curlRequest(
      'POST',
      'http://localhost:3000/api/verify-unique-id',
      { uniqueId: ticket.unique_id, action: 'checkin' }
    );
    
    if (checkinResult && checkinResult.success) {
      log('green', '✅ Check-in réussi');
      log('white', `   • Participant: ${checkinResult.ticket.name}`);
      log('white', `   • Heure: ${new Date(checkinResult.ticket.checked_in_at).toLocaleString('fr-FR')}`);
    } else {
      log('red', '❌ Check-in échoué');
      if (checkinResult) log('red', `   • ${checkinResult.message}`);
    }
  } else {
    log('yellow', '\n⏭️  Ticket déjà checké, skip du check-in');
  }
  
  log('cyan', '\n📊 Statistiques finales:');
  const statsResult = await curlRequest('GET', 'http://localhost:3000/api/verify-unique-id');
  
  if (statsResult && statsResult.success) {
    log('white', `   • IDs générés: ${statsResult.stats.total_unique_ids}`);
    log('white', `   • IDs assignés: ${statsResult.stats.assigned_ids}`);
    log('white', `   • Tickets avec unique_id: ${statsResult.stats.tickets_with_unique_id}`);
    log('white', `   • Check-ins: ${statsResult.stats.checked_in_unique_ids}`);
    log('white', `   • Taux d'utilisation: ${statsResult.stats.usage_rate}%`);
  }
  
  log('green', '\n🎉 Test complet terminé !');
  log('cyan', 'ℹ️  Le système peut maintenant gérer:');
  log('white', '   • Génération dynamique d\'IDs quand la base est vide');
  log('white', '   • QR codes avec ID simple (AIK-XXXXXX)');
  log('white', '   • QR codes avec JSON complet');
  log('white', '   • Vérification et check-in dans les deux cas');
}

main().catch(error => {
  log('red', `❌ Erreur fatale: ${error.message}`);
  process.exit(1);
});
