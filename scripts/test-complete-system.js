#!/usr/bin/env node

/**
 * Script pour tester le système complet de réservation
 */

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

async function testReservationAPI() {
  log('cyan', '🧪 Test de l\'API de réservation...');
  
  try {
    const response = await fetch('http://localhost:3000/api/create-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Système Complet',
        email: 'test.systeme@aikarangue.sn',
        phone: '+221 77 888 99 00',
        company: 'Test Company',
        fonction: 'Testeur Système'
      })
    });
    
    if (!response.ok) {
      log('red', `❌ Erreur HTTP: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && data.reservation) {
      log('green', '✅ API de réservation fonctionne !');
      log('white', `   • ID Ticket: ${data.reservation.id}`);
      log('white', `   • ID Unique: ${data.reservation.unique_id}`);
      log('white', `   • Nom: ${data.reservation.name}`);
      log('white', `   • Format ID: ${data.reservation.unique_id.startsWith('AIK-') ? '✅ Correct' : '❌ Incorrect'}`);
      return data.reservation;
    } else {
      log('red', `❌ Erreur API: ${data.message}`);
      return null;
    }
  } catch (error) {
    log('red', `❌ Erreur réseau: ${error.message}`);
    return null;
  }
}

async function testVerificationAPI(uniqueId) {
  log('cyan', `🔍 Test de vérification pour ${uniqueId}...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/verify-unique-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uniqueId: uniqueId,
        action: 'verify'
      })
    });
    
    if (!response.ok) {
      log('red', `❌ Erreur HTTP: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.success && data.status === 'valid') {
      log('green', '✅ Vérification fonctionne !');
      log('white', `   • Statut: ${data.status}`);
      log('white', `   • Message: ${data.message}`);
      return true;
    } else {
      log('red', `❌ Vérification échouée: ${data.message}`);
      return false;
    }
  } catch (error) {
    log('red', `❌ Erreur vérification: ${error.message}`);
    return false;
  }
}

async function testCheckInAPI(uniqueId) {
  log('cyan', `✅ Test de check-in pour ${uniqueId}...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/verify-unique-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uniqueId: uniqueId,
        action: 'checkin'
      })
    });
    
    if (!response.ok) {
      log('red', `❌ Erreur HTTP: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.success) {
      log('green', '✅ Check-in fonctionne !');
      log('white', `   • Message: ${data.message}`);
      return true;
    } else {
      log('red', `❌ Check-in échoué: ${data.message}`);
      return false;
    }
  } catch (error) {
    log('red', `❌ Erreur check-in: ${error.message}`);
    return false;
  }
}

async function testConversionAPI(ticketId) {
  log('cyan', `🔄 Test de conversion pour ${ticketId}...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/convert-ticket-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticketId })
    });
    
    if (!response.ok) {
      log('red', `❌ Erreur HTTP: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && data.uniqueId) {
      log('green', '✅ Conversion fonctionne !');
      log('white', `   • ${ticketId} → ${data.uniqueId}`);
      log('white', `   • Participant: ${data.participant.name}`);
      return data.uniqueId;
    } else {
      log('red', `❌ Conversion échouée: ${data.message}`);
      return null;
    }
  } catch (error) {
    log('red', `❌ Erreur conversion: ${error.message}`);
    return null;
  }
}

async function testPages() {
  log('cyan', '🌐 Test des pages web...');
  
  const pages = [
    { url: 'http://localhost:3000/', name: 'Page d\'accueil', test: 'AI-Karangué' },
    { url: 'http://localhost:3000/reserve', name: 'Page de réservation', test: 'Réserver Ma Place' },
    { url: 'http://localhost:3000/scanner-ids.html', name: 'Scanner IDs', test: 'Scanner IDs AI-Karangué' }
  ];
  
  let pagesOK = 0;
  
  for (const page of pages) {
    try {
      const response = await fetch(page.url);
      const text = await response.text();
      
      if (response.ok && text.includes(page.test)) {
        log('green', `✅ ${page.name}`);
        pagesOK++;
      } else {
        log('red', `❌ ${page.name} - Contenu manquant`);
      }
    } catch (error) {
      log('red', `❌ ${page.name} - Erreur: ${error.message}`);
    }
  }
  
  return pagesOK === pages.length;
}

async function main() {
  log('magenta', '🚀 TEST COMPLET DU SYSTÈME AI-KARANGUÉ');
  log('magenta', '='.repeat(50));
  
  let allTestsPassed = true;
  
  // 1. Test des pages
  const pagesOK = await testPages();
  if (!pagesOK) allTestsPassed = false;
  
  log('');
  
  // 2. Test de création de réservation
  const reservation = await testReservationAPI();
  if (!reservation) {
    allTestsPassed = false;
  } else {
    log('');
    
    // 3. Test de vérification
    const verificationOK = await testVerificationAPI(reservation.unique_id);
    if (!verificationOK) allTestsPassed = false;
    
    log('');
    
    // 4. Test de check-in
    const checkinOK = await testCheckInAPI(reservation.unique_id);
    if (!checkinOK) allTestsPassed = false;
    
    log('');
    
    // 5. Test de conversion (avec l'ancien ID)
    const convertedId = await testConversionAPI(reservation.id);
    if (!convertedId) allTestsPassed = false;
  }
  
  log('');
  log('magenta', '='.repeat(50));
  
  if (allTestsPassed) {
    log('green', '🎉 TOUS LES TESTS SONT PASSÉS !');
    log('green', '✅ Le système AI-Karangué fonctionne parfaitement !');
    log('white', '');
    log('cyan', '📋 Résumé des fonctionnalités testées :');
    log('white', '   • ✅ Pages web accessibles');
    log('white', '   • ✅ Création de réservations avec IDs AIK-XXXXXX');
    log('white', '   • ✅ Vérification des IDs uniques');
    log('white', '   • ✅ Check-in des participants');
    log('white', '   • ✅ Conversion des anciens IDs');
    log('white', '');
    log('blue', '🌟 Le système est prêt pour la production !');
  } else {
    log('red', '❌ CERTAINS TESTS ONT ÉCHOUÉ');
    log('yellow', '⚠️  Veuillez corriger les erreurs avant de continuer');
  }
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}
