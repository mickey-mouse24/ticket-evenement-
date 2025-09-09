#!/usr/bin/env node

/**
 * Script de test pour le système d'IDs uniques
 */

const { assignIdToTicket, isValidId } = require('./generate-unique-ids');
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

// Créer un ticket de test avec ID unique
async function createTestTicket() {
  try {
    log('cyan', '🎫 Création d\'un ticket de test avec ID unique...');
    
    // Générer un ID de ticket
    const ticketId = 'test-' + Math.random().toString(36).substr(2, 9);
    
    // Assigner un ID unique
    const uniqueId = await assignIdToTicket(ticketId);
    
    if (!uniqueId) {
      log('red', '❌ Aucun ID unique disponible');
      return;
    }
    
    // Créer le ticket
    const ticket = {
      id: ticketId,
      unique_id: uniqueId,
      name: 'Test Participant',
      email: 'test@aikarangue.sn',
      phone: '+221 77 123 45 67',
      company: 'AI-Karangué Test',
      fonction: 'Testeur',
      qrcode: `AIK2025-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      checked_in: false,
      created_at: new Date().toISOString(),
      checked_in_at: null
    };
    
    // Ajouter aux tickets
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    let ticketsData = { tickets: [] };
    
    try {
      const existingData = await fs.readFile(ticketsPath, 'utf8');
      ticketsData = JSON.parse(existingData);
    } catch (error) {
      // Fichier n'existe pas, on utilise la structure par défaut
    }
    
    ticketsData.tickets.push(ticket);
    await fs.writeFile(ticketsPath, JSON.stringify(ticketsData, null, 2));
    
    log('green', `✅ Ticket créé avec succès !`);
    log('white', `   Ticket ID: ${ticketId}`);
    log('white', `   ID Unique: ${uniqueId}`);
    log('white', `   Participant: ${ticket.name}`);
    log('white', `   QR Code: ${ticket.qrcode}`);
    
    return { ticketId, uniqueId, ticket };
    
  } catch (error) {
    log('red', `❌ Erreur création ticket: ${error.message}`);
    return null;
  }
}

// Tester la vérification d'un ID
async function testVerification(uniqueId) {
  try {
    log('blue', `🔍 Test de vérification pour ID: ${uniqueId}`);
    
    const response = await fetch('http://localhost:3000/api/verify-unique-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uniqueId: uniqueId,
        action: 'verify'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('green', `✅ ${data.message}`);
      if (data.ticket) {
        log('white', `   Participant: ${data.ticket.name}`);
        log('white', `   Email: ${data.ticket.email}`);
        log('white', `   Statut: ${data.ticket.checked_in ? 'Utilisé' : 'Valide'}`);
      }
    } else {
      log('yellow', `⚠️  ${data.message}`);
    }
    
    return data;
    
  } catch (error) {
    log('red', `❌ Erreur vérification: ${error.message}`);
    return null;
  }
}

// Tester le check-in d'un ID
async function testCheckin(uniqueId) {
  try {
    log('blue', `🚪 Test de check-in pour ID: ${uniqueId}`);
    
    const response = await fetch('http://localhost:3000/api/verify-unique-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uniqueId: uniqueId,
        action: 'checkin'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('green', `✅ ${data.message}`);
      if (data.ticket) {
        log('white', `   Check-in: ${new Date(data.ticket.checked_in_at).toLocaleString('fr-FR')}`);
      }
    } else {
      log('red', `❌ ${data.message}`);
    }
    
    return data;
    
  } catch (error) {
    log('red', `❌ Erreur check-in: ${error.message}`);
    return null;
  }
}

// Vérifier que le serveur est accessible
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Test complet du système
async function runCompleteTest() {
  log('magenta', '🚀 Test complet du système d\'IDs uniques AI-Karangué\n');
  
  // Vérifier le serveur
  const serverOk = await checkServer();
  if (!serverOk) {
    log('red', '❌ Serveur non accessible sur http://localhost:3000');
    log('yellow', '💡 Démarrez le serveur avec: npm run dev');
    return;
  }
  
  log('green', '✅ Serveur accessible');
  
  // Créer un ticket de test
  const testResult = await createTestTicket();
  if (!testResult) {
    return;
  }
  
  const { uniqueId } = testResult;
  
  log('cyan', '\n--- Test de vérification ---');
  
  // Test 1: Vérifier l'ID
  await testVerification(uniqueId);
  
  log('cyan', '\n--- Test de check-in ---');
  
  // Test 2: Check-in
  await testCheckin(uniqueId);
  
  log('cyan', '\n--- Test de double check-in ---');
  
  // Test 3: Tenter un double check-in
  await testCheckin(uniqueId);
  
  log('cyan', '\n--- Test d\'ID invalide ---');
  
  // Test 4: ID invalide
  await testVerification('AIK-INVALID');
  
  log('magenta', '\n🎉 Test complet terminé !');
  log('yellow', '\n💡 Vous pouvez maintenant utiliser l\'interface:');
  log('green', '   http://localhost:3000/scanner-ids.html');
  log('green', `   Testez avec l'ID: ${uniqueId}`);
}

// Démarrage du script
if (require.main === module) {
  runCompleteTest().catch(error => {
    log('red', `❌ Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}
