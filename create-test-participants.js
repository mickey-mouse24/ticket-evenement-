#!/usr/bin/env node

/**
 * Script pour créer des participants de test pour démonstration
 * Usage: node create-test-participants.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');

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
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Données de test variées
const testParticipants = [
  {
    name: 'Aminata Diallo',
    email: 'aminata.diallo@orange.sn',
    phone: '771234567',
    company: 'Orange Sénégal',
    fonction: 'Chef de Projet Innovation'
  },
  {
    name: 'Moussa Kane',
    email: 'moussa.kane@expresso.sn',
    phone: '781234567',
    company: 'Expresso Sénégal',
    fonction: 'Directeur Technique'
  },
  {
    name: 'Fatou Sall',
    email: 'fatou@senegalecole.com',
    phone: '774567890',
    company: 'École Numérique Sénégal',
    fonction: 'Responsable Formation'
  },
  {
    name: 'Omar Ba',
    email: 'omar.ba@atos.net',
    phone: '785678901',
    company: 'Atos Sénégal',
    fonction: 'Consultant IT'
  },
  {
    name: 'Aïcha Ndiaye',
    email: 'aicha@startup.sn',
    phone: '778901234',
    company: 'TechHub Dakar',
    fonction: 'Entrepreneuse'
  },
  {
    name: 'Ibrahima Sarr',
    email: 'ibrahima@banque-atlantique.sn',
    phone: '779012345',
    company: 'Banque Atlantique',
    fonction: 'Responsable Digital'
  }
];

async function createParticipant(participant) {
  try {
    const cmd = `curl -s -X POST http://localhost:3000/api/reservations \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify(participant)}'`;
    
    const { stdout } = await execAsync(cmd);
    const result = JSON.parse(stdout);
    
    if (result.success) {
      log('green', `✅ ${participant.name} - ${participant.company} créé(e)`);
      return true;
    } else {
      log('red', `❌ Erreur pour ${participant.name}: ${result.message}`);
      return false;
    }
  } catch (error) {
    log('red', `❌ Erreur réseau pour ${participant.name}: ${error.message}`);
    return false;
  }
}

async function main() {
  log('magenta', '🚀 Création de participants de test pour la démonstration\n');
  
  let successful = 0;
  let failed = 0;
  
  for (let i = 0; i < testParticipants.length; i++) {
    const participant = testParticipants[i];
    
    log('cyan', `\n📝 Création du participant ${i + 1}/${testParticipants.length}:`);
    log('white', `   • ${participant.name} - ${participant.fonction}`);
    log('white', `   • ${participant.company}`);
    log('white', `   • ${participant.email}`);
    
    const success = await createParticipant(participant);
    
    if (success) {
      successful++;
    } else {
      failed++;
    }
    
    // Petite pause entre les créations
    if (i < testParticipants.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  log('white', '\n' + '='.repeat(50));
  log('green', `\n🎉 Création terminée !`);
  log('white', `   • Participants créés: ${successful}`);
  if (failed > 0) {
    log('red', `   • Échecs: ${failed}`);
  }
  
  log('blue', `\n💡 Vous pouvez maintenant voir tous les participants sur:`);
  log('cyan', `   http://localhost:3000/admin`);
  
  log('yellow', `\n📊 Le tableau affiche maintenant:`);
  log('white', `   • Statut (enregistré/en attente)`);
  log('white', `   • Nom et ID du participant`);
  log('white', `   • Email et téléphone`);
  log('white', `   • Entreprise et fonction`);
  log('white', `   • ID unique (pour vérification)`);
  log('white', `   • Date d'inscription`);
  log('white', `   • Statut et heure de check-in`);
  log('white', `   • Filtres par statut (Tous/Enregistrés/En attente)`);
}

main().catch(error => {
  log('red', `❌ Erreur fatale: ${error.message}`);
  process.exit(1);
});
