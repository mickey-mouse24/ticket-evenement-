#!/usr/bin/env node

/**
 * Script pour décoder les QR codes et extraire les données JSON
 */

const QRCode = require('qrcode');
const jimp = require('jimp');
const jsQR = require('jsqr');

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

async function testQRGeneration() {
  log('cyan', '🔧 Test de génération de QR code...');
  
  // Données de test
  const testData = {
    id: 'AIK-TEST01',
    ticketId: 'test123',
    name: 'Test User',
    email: 'test@example.com',
    company: 'Test Company',
    event: 'AI-Karangué 2025',
    date: '2025-09-20',
    venue: 'CICAD - RUFISQUE'
  };
  
  try {
    // Générer le QR code
    const qrDataURL = await QRCode.toDataURL(JSON.stringify(testData), {
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
    
    log('green', '✅ QR code généré avec succès !');
    log('white', `   • Données: ${JSON.stringify(testData, null, 2)}`);
    log('white', `   • Format: PNG base64`);
    log('white', `   • Taille: ${qrDataURL.length} caractères`);
    
    return qrDataURL;
  } catch (error) {
    log('red', `❌ Erreur génération QR: ${error.message}`);
    return null;
  }
}

async function decodeQRFromDataURL(dataURL) {
  log('cyan', '🔍 Décodage du QR code...');
  
  try {
    // Extraire les données base64
    const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Lire l'image avec Jimp
    const image = await jimp.read(buffer);
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height
    };
    
    // Décoder le QR code
    const qrResult = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (qrResult) {
      log('green', '✅ QR code décodé avec succès !');
      log('white', `   • Données brutes: ${qrResult.data}`);
      
      try {
        const parsedData = JSON.parse(qrResult.data);
        log('blue', '📋 Données JSON décodées:');
        Object.entries(parsedData).forEach(([key, value]) => {
          log('white', `   • ${key}: ${value}`);
        });
        return parsedData;
      } catch (e) {
        log('yellow', '⚠️  Les données ne sont pas au format JSON');
        return qrResult.data;
      }
    } else {
      log('red', '❌ Impossible de décoder le QR code');
      return null;
    }
  } catch (error) {
    log('red', `❌ Erreur décodage: ${error.message}`);
    return null;
  }
}

async function testAPIQRCode() {
  log('cyan', '🌐 Test de l\'API de réservation...');
  
  try {
    const response = await fetch('http://localhost:3000/api/create-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test QR Décodage',
        email: 'qr.decode@test.sn',
        phone: '+221 77 555 66 77',
        company: 'QR Decode Co',
        fonction: 'Testeur QR'
      })
    });
    
    if (!response.ok) {
      log('red', `❌ Erreur API: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && data.qr) {
      log('green', '✅ Réservation créée avec QR code !');
      log('white', `   • ID: ${data.reservation.unique_id}`);
      log('white', `   • Nom: ${data.reservation.name}`);
      
      // Décoder le QR code reçu
      const decodedData = await decodeQRFromDataURL(data.qr);
      
      if (decodedData) {
        log('magenta', '🎉 Test complet réussi !');
        return decodedData;
      }
    } else {
      log('red', `❌ Erreur réservation: ${data.message}`);
    }
  } catch (error) {
    log('red', `❌ Erreur réseau: ${error.message}`);
  }
  
  return null;
}

async function main() {
  log('magenta', '🔬 TEST DU SYSTÈME QR CODE AI-KARANGUÉ');
  log('magenta', '='.repeat(50));
  
  try {
    // 1. Test de génération locale
    const localQR = await testQRGeneration();
    if (localQR) {
      await decodeQRFromDataURL(localQR);
    }
    
    log('');
    
    // 2. Test de l'API
    await testAPIQRCode();
    
    log('');
    log('blue', '💡 Instructions d\'utilisation:');
    log('white', '   1. Créez un ticket sur http://localhost:3000/reserve');
    log('white', '   2. Téléchargez le PDF avec le QR code');
    log('white', '   3. Scannez le QR avec votre téléphone');
    log('white', '   4. Collez les données JSON dans http://localhost:3000/scanner-ids.html');
    log('white', '   5. Le système extraira automatiquement l\'ID unique');
    
  } catch (error) {
    log('red', `❌ Erreur fatale: ${error.message}`);
  }
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Erreur: ${error.message}`);
    process.exit(1);
  });
}
