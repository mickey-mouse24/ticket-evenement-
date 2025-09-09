#!/usr/bin/env node

/**
 * Script pour tester les interfaces de scanner QR
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

async function testScannerInterfaces() {
  log('cyan', '🔬 TEST DES INTERFACES SCANNER');
  log('cyan', '='.repeat(40));
  
  const interfaces = [
    {
      name: 'Scanner Principal',
      url: 'http://localhost:3000/scanner-ids.html',
      tests: [
        'Scanner IDs AI-Karangué',
        'html5-qrcode',
        'Démarrer Scanner'
      ]
    },
    {
      name: 'Scanner Simple',
      url: 'http://localhost:3000/scanner-simple.html',
      tests: [
        'Scanner AI-Karangué',
        'ZXing',
        'Démarrer Scanner'
      ]
    }
  ];
  
  for (const iface of interfaces) {
    log('blue', `\n📱 Test ${iface.name}:`);
    
    try {
      const response = await fetch(iface.url);
      if (!response.ok) {
        log('red', `   ❌ HTTP ${response.status}`);
        continue;
      }
      
      const html = await response.text();
      
      let testsPass = 0;
      for (const test of iface.tests) {
        if (html.includes(test)) {
          log('green', `   ✅ ${test}`);
          testsPass++;
        } else {
          log('red', `   ❌ ${test} manquant`);
        }
      }
      
      const percentage = Math.round((testsPass / iface.tests.length) * 100);
      log('white', `   📊 Score: ${testsPass}/${iface.tests.length} (${percentage}%)`);
      
      // Test des librairies
      if (html.includes('html5-qrcode')) {
        log('green', '   ✅ Html5Qrcode chargé');
      }
      if (html.includes('ZXing')) {
        log('green', '   ✅ ZXing chargé');
      }
      
    } catch (error) {
      log('red', `   ❌ Erreur: ${error.message}`);
    }
  }
}

async function testQRGeneration() {
  log('cyan', '\n🎯 TEST DE GÉNÉRATION QR');
  log('cyan', '='.repeat(30));
  
  try {
    // Créer un nouveau ticket avec QR
    const response = await fetch('http://localhost:3000/api/create-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Scanner Debug',
        email: 'scanner.debug@test.sn',
        phone: '+221 77 999 88 99',
        company: 'Scanner Test Co',
        fonction: 'Testeur Scanner'
      })
    });
    
    if (!response.ok) {
      log('red', `❌ Erreur API: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && data.qr) {
      log('green', '✅ Ticket créé avec QR code');
      log('white', `   • ID: ${data.reservation.unique_id}`);
      log('white', `   • QR taille: ${data.qr.length} chars`);
      log('white', `   • Format: ${data.qr.substring(0, 30)}...`);
      
      return data.reservation.unique_id;
    } else {
      log('red', `❌ Erreur création: ${data.message}`);
      return null;
    }
    
  } catch (error) {
    log('red', `❌ Erreur réseau: ${error.message}`);
    return null;
  }
}

async function testVerificationAPI(uniqueId) {
  log('cyan', '\n🔍 TEST API VÉRIFICATION');
  log('cyan', '='.repeat(25));
  
  if (!uniqueId) {
    log('yellow', '⚠️  Pas d\'ID à tester');
    return;
  }
  
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
      return;
    }
    
    const result = await response.json();
    
    if (result.success && result.status === 'valid') {
      log('green', '✅ Vérification réussie');
      log('white', `   • Statut: ${result.status}`);
      log('white', `   • Participant: ${result.ticket.name}`);
    } else {
      log('red', `❌ Vérification échouée: ${result.message}`);
    }
    
  } catch (error) {
    log('red', `❌ Erreur API: ${error.message}`);
  }
}

function showInstructions() {
  log('magenta', '\n📋 INSTRUCTIONS DE DÉPANNAGE');
  log('magenta', '='.repeat(35));
  
  log('blue', '🔧 Si le scanner ne fonctionne pas:');
  log('white', '   1. Vérifiez que vous êtes en HTTPS (requis pour caméra)');
  log('white', '   2. Autorisez l\'accès à la caméra dans votre navigateur');
  log('white', '   3. Utilisez Chrome, Firefox ou Safari récent');
  log('white', '   4. Testez avec scanner-simple.html (plus compatible)');
  
  log('blue', '\n📱 URLs disponibles:');
  log('white', '   • Scanner principal: http://localhost:3000/scanner-ids.html');
  log('white', '   • Scanner simple:    http://localhost:3000/scanner-simple.html');
  
  log('blue', '\n🧪 Tests manuels:');
  log('white', '   1. Ouvrir une des URLs dans le navigateur');
  log('white', '   2. Cliquer "Test Scanner" ou "Test Caméra"');
  log('white', '   3. Vérifier les messages d\'erreur dans la console (F12)');
  log('white', '   4. Essayer la saisie manuelle avec un ID de test');
  
  log('blue', '\n🎯 ID de test disponible:');
  log('white', '   • Tapez "AIK-TEST99" dans la saisie manuelle');
  log('white', '   • Ou utilisez l\'ID généré ci-dessus');
}

async function main() {
  log('magenta', '🚀 DIAGNOSTIC COMPLET DU SCANNER QR');
  log('magenta', '='.repeat(50));
  
  // Test des interfaces
  await testScannerInterfaces();
  
  // Test de génération
  const testId = await testQRGeneration();
  
  // Test de vérification
  await testVerificationAPI(testId);
  
  // Instructions
  showInstructions();
  
  log('');
  log('green', '✨ Diagnostic terminé !');
  log('white', 'Consultez les résultats ci-dessus pour identifier les problèmes.');
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}
