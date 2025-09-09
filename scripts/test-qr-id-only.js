#!/usr/bin/env node

/**
 * Script pour tester les QR codes qui contiennent seulement l'ID unique
 */

const QRCode = require('qrcode');
const fs = require('fs').promises;

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

async function generateSimpleQR() {
  log('cyan', '🎯 Génération d\'un QR code avec ID uniquement...');
  
  const testId = 'AIK-TEST99';
  
  try {
    // Générer le QR code avec seulement l'ID
    const qrDataURL = await QRCode.toDataURL(testId, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    log('green', '✅ QR code simple généré !');
    log('white', `   • Contenu: ${testId}`);
    log('white', `   • Taille: ${qrDataURL.length} caractères`);
    
    // Sauvegarder
    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
    await fs.writeFile('simple-qr.png', base64Data, 'base64');
    log('blue', '💾 QR code sauvegardé: simple-qr.png');
    
    // Générer aussi en ASCII pour voir
    const asciiQR = await QRCode.toString(testId, { type: 'terminal' });
    log('blue', 'QR Code en ASCII:');
    console.log(asciiQR);
    
    return testId;
  } catch (error) {
    log('red', `❌ Erreur génération: ${error.message}`);
    return null;
  }
}

async function testAPISimpleQR() {
  log('cyan', '🌐 Test de l\'API avec QR code ID uniquement...');
  
  try {
    const response = await fetch('http://localhost:3000/api/create-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test QR ID Simple',
        email: 'qr.id@simple.sn',
        phone: '+221 77 999 00 11',
        company: 'Simple ID QR Co',
        fonction: 'Testeur QR ID'
      })
    });
    
    if (!response.ok) {
      log('red', `❌ Erreur API: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && data.qr) {
      log('green', '✅ Ticket créé avec QR code ID !');
      log('white', `   • ID Unique: ${data.reservation.unique_id}`);
      log('white', `   • Nom: ${data.reservation.name}`);
      
      // Sauvegarder le QR code de l'API
      const base64Data = data.qr.replace(/^data:image\/png;base64,/, '');
      await fs.writeFile('api-simple-qr.png', base64Data, 'base64');
      log('blue', '💾 QR code API sauvegardé: api-simple-qr.png');
      
      return data.reservation.unique_id;
    } else {
      log('red', `❌ Erreur réservation: ${data.message}`);
      return null;
    }
  } catch (error) {
    log('red', `❌ Erreur réseau: ${error.message}`);
    return null;
  }
}

async function testVerification(uniqueId) {
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
      log('green', '✅ Vérification réussie !');
      log('white', `   • Statut: ${data.status}`);
      log('white', `   • Message: ${data.message}`);
      log('white', `   • Participant: ${data.ticket.name}`);
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

async function main() {
  log('magenta', '🔬 TEST QR CODE AVEC ID UNIQUE SEULEMENT');
  log('magenta', '='.repeat(45));
  
  // 1. Test génération simple
  const testId = await generateSimpleQR();
  
  log('');
  
  // 2. Test API
  const apiId = await testAPISimpleQR();
  
  if (apiId) {
    log('');
    
    // 3. Test vérification
    await testVerification(apiId);
  }
  
  log('');
  log('blue', '📋 Résumé:');
  log('white', '   • Le QR code contient maintenant SEULEMENT l\'ID unique');
  log('white', '   • Format: AIK-XXXXXX (10 caractères)');
  log('white', '   • Plus simple à scanner et traiter');
  log('white', '   • Plus sécurisé (pas d\'infos personnelles dans le QR)');
  
  log('');
  log('green', '🎯 Instructions d\'utilisation:');
  log('white', '   1. Scannez le QR code avec votre téléphone');
  log('white', '   2. Vous verrez l\'ID unique (ex: AIK-ABC123)');
  log('white', '   3. Tapez cet ID dans le scanner web');
  log('white', '   4. Le système vérifiera automatiquement');
  
  log('');
  log('yellow', '📱 Fichiers générés pour test:');
  log('white', '   • simple-qr.png - QR avec ID de test');
  log('white', '   • api-simple-qr.png - QR de l\'API réelle');
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Erreur: ${error.message}`);
    process.exit(1);
  });
}
