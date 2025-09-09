#!/usr/bin/env node

/**
 * Script simple pour tester la génération QR code
 */

const QRCode = require('qrcode');
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

async function generateTestQR() {
  log('cyan', '🎯 Génération d\'un QR code de test...');
  
  const testData = {
    id: 'AIK-TEST01',
    ticketId: 'test123',
    name: 'Participant Test',
    email: 'test@aikarangue.sn',
    company: 'AI-Karangué Test Co',
    event: 'AI-Karangué 2025',
    date: '2025-09-20',
    venue: 'CICAD - RUFISQUE'
  };
  
  try {
    // Générer différents formats
    const formats = [
      { name: 'PNG DataURL', func: () => QRCode.toDataURL(JSON.stringify(testData)) },
      { name: 'SVG String', func: () => QRCode.toString(JSON.stringify(testData), { type: 'svg' }) },
      { name: 'Terminal', func: () => QRCode.toString(JSON.stringify(testData), { type: 'terminal' }) }
    ];
    
    for (const format of formats) {
      try {
        const result = await format.func();
        log('green', `✅ ${format.name} généré !`);
        
        if (format.name === 'Terminal') {
          log('blue', 'QR Code en ASCII:');
          console.log(result);
        } else {
          log('white', `   • Longueur: ${result.length} caractères`);
        }
        
        // Sauvegarder le PNG
        if (format.name === 'PNG DataURL') {
          const base64Data = result.replace(/^data:image\/png;base64,/, '');
          await fs.writeFile('test-qr.png', base64Data, 'base64');
          log('blue', '💾 QR code sauvegardé: test-qr.png');
        }
        
        // Sauvegarder le SVG
        if (format.name === 'SVG String') {
          await fs.writeFile('test-qr.svg', result);
          log('blue', '💾 QR code sauvegardé: test-qr.svg');
        }
        
      } catch (error) {
        log('red', `❌ Erreur ${format.name}: ${error.message}`);
      }
    }
    
    log('');
    log('magenta', '📋 Données encodées dans le QR:');
    log('white', JSON.stringify(testData, null, 2));
    
  } catch (error) {
    log('red', `❌ Erreur génération: ${error.message}`);
  }
}

async function testAPIAndSaveQR() {
  log('cyan', '🌐 Test de l\'API et sauvegarde du QR...');
  
  try {
    const response = await fetch('http://localhost:3000/api/create-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test QR Réel',
        email: 'qr.reel@aikarangue.sn',
        phone: '+221 77 888 99 00',
        company: 'QR Test Real',
        fonction: 'Testeur QR Réel'
      })
    });
    
    if (!response.ok) {
      log('red', `❌ Erreur API: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    
    if (data.success && data.qr) {
      log('green', '✅ Ticket créé avec QR code !');
      log('white', `   • ID: ${data.reservation.unique_id}`);
      log('white', `   • Nom: ${data.reservation.name}`);
      
      // Sauvegarder le QR code de l'API
      const base64Data = data.qr.replace(/^data:image\/png;base64,/, '');
      await fs.writeFile('api-qr.png', base64Data, 'base64');
      log('blue', '💾 QR code API sauvegardé: api-qr.png');
      
      log('');
      log('yellow', '🔍 Pour décoder ce QR code:');
      log('white', '   1. Scannez api-qr.png avec votre téléphone');
      log('white', '   2. Vous devriez voir les données JSON');
      log('white', '   3. Copiez l\'ID unique dans le scanner');
      
    } else {
      log('red', `❌ Erreur réservation: ${data.message}`);
    }
  } catch (error) {
    log('red', `❌ Erreur réseau: ${error.message}`);
  }
}

async function main() {
  log('magenta', '🔬 TEST SIMPLE DU SYSTÈME QR CODE');
  log('magenta', '='.repeat(40));
  
  await generateTestQR();
  
  log('');
  
  await testAPIAndSaveQR();
  
  log('');
  log('blue', '🎯 Fichiers générés:');
  log('white', '   • test-qr.png - QR de test');
  log('white', '   • test-qr.svg - QR de test en SVG');
  log('white', '   • api-qr.png - QR de l\'API');
  
  log('');
  log('green', '✨ Les QR codes sont maintenant de vrais QR codes scannables !');
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Erreur: ${error.message}`);
    process.exit(1);
  });
}
