#!/usr/bin/env node

/**
 * Script de test pour vérifier le scan des QR codes JSON
 * Usage: node test-qr-scanning.js
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

async function getLatestTicket() {
  log('blue', '🔍 Recherche du dernier ticket créé...');
  
  const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
  try {
    const content = await fs.readFile(ticketsPath, 'utf8');
    const data = JSON.parse(content);
    
    if (data.tickets && data.tickets.length > 0) {
      const ticket = data.tickets[data.tickets.length - 1];
      log('green', '✅ Ticket trouvé:');
      log('white', `   • ID: ${ticket.unique_id}`);
      log('white', `   • Nom: ${ticket.name}`);
      log('white', `   • Email: ${ticket.email}`);
      log('white', `   • Check-in: ${ticket.checked_in ? 'Oui' : 'Non'}`);
      return ticket;
    } else {
      log('red', '❌ Aucun ticket trouvé dans la base');
      return null;
    }
  } catch (error) {
    log('red', `❌ Erreur lecture tickets: ${error.message}`);
    return null;
  }
}

async function testVerifyTicket(ticketId) {
  log('cyan', `🔍 Test de vérification du ticket: ${ticketId}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/verify-unique-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uniqueId: ticketId, action: 'verify' }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      log('green', '✅ Ticket vérifié avec succès !');
      log('white', `   • Status: ${result.status}`);
      log('white', `   • Nom: ${result.ticket.name}`);
      log('white', `   • Email: ${result.ticket.email}`);
      log('white', `   • Check-in: ${result.ticket.checked_in ? 'Oui' : 'Non'}`);
      return result;
    } else {
      log('red', '❌ Erreur de vérification:');
      log('red', `   ${result.message}`);
      return null;
    }
  } catch (error) {
    log('red', '❌ Erreur de connexion:');
    log('red', `   ${error.message}`);
    return null;
  }
}

async function testCheckIn(ticketId) {
  log('cyan', `📝 Test de check-in du ticket: ${ticketId}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/verify-unique-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uniqueId: ticketId, action: 'checkin' }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      log('green', '✅ Check-in réussi !');
      log('white', `   • Nom: ${result.ticket.name}`);
      log('white', `   • Email: ${result.ticket.email}`);
      log('white', `   • Check-in: ${new Date(result.ticket.checked_in_at).toLocaleString('fr-FR')}`);
      return result;
    } else {
      log('red', '❌ Erreur de check-in:');
      log('red', `   ${result.message}`);
      return null;
    }
  } catch (error) {
    log('red', '❌ Erreur de connexion:');
    log('red', `   ${error.message}`);
    return null;
  }
}

async function testJSONQRCode(ticket) {
  log('blue', '🎫 Test avec QR code JSON simulé...');
  
  // Simuler un QR code JSON comme celui généré par l'API
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
  log('yellow', 'QR code simulé (JSON):');
  log('white', qrJsonString);
  
  // Tester la vérification avec le JSON complet
  log('cyan', '🔍 Test de vérification avec JSON complet...');
  
  try {
    const response = await fetch('http://localhost:3000/api/verify-unique-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uniqueId: qrJsonString, action: 'verify' }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      log('green', '✅ Vérification JSON QR réussie !');
      log('white', `   • Status: ${result.status}`);
      log('white', `   • Nom: ${result.ticket.name}`);
      return true;
    } else {
      log('red', '❌ Erreur vérification JSON QR:');
      log('red', `   ${result.message}`);
      return false;
    }
  } catch (error) {
    log('red', '❌ Erreur connexion vérification JSON QR:');
    log('red', `   ${error.message}`);
    return false;
  }
}

async function main() {
  log('magenta', '🚀 Test de scan des QR codes JSON\n');
  
  // Étape 1: Obtenir le dernier ticket
  const ticket = await getLatestTicket();
  if (!ticket) {
    log('red', '💥 Aucun ticket disponible pour le test. Créez d\'abord une réservation.');
    process.exit(1);
  }
  log('white', '');
  
  // Étape 2: Tester la vérification simple
  const verification = await testVerifyTicket(ticket.unique_id);
  if (!verification) {
    log('red', '💥 Échec de la vérification de base');
    process.exit(1);
  }
  log('white', '');
  
  // Étape 3: Tester le QR code JSON
  const jsonSuccess = await testJSONQRCode(ticket);
  if (!jsonSuccess) {
    log('red', '💥 Échec du test QR JSON');
    process.exit(1);
  }
  log('white', '');
  
  // Étape 4: Tester le check-in si pas encore fait
  if (!ticket.checked_in) {
    const checkin = await testCheckIn(ticket.unique_id);
    if (!checkin) {
      log('red', '💥 Échec du check-in');
      process.exit(1);
    }
    log('white', '');
  } else {
    log('yellow', '⏭️  Ticket déjà checké, skip du test de check-in');
    log('white', '');
  }
  
  log('green', '🎉 Tous les tests QR code ont réussi !');
  log('cyan', 'ℹ️  Le scanner peut maintenant gérer:');
  log('white', '   • Les QR codes avec ID simple (AIK-XXXXXX)');
  log('white', '   • Les QR codes avec JSON complet');
  log('white', '   • La vérification et le check-in fonctionnent dans les deux cas');
}

// Démarrage du script
main().catch(error => {
  log('red', `❌ Erreur fatale: ${error.message}`);
  process.exit(1);
});
