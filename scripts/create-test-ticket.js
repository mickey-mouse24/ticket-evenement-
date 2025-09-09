#!/usr/bin/env node

/**
 * Script pour créer un ticket de test SANS check-in automatique
 */

const { assignIdToTicket } = require('./generate-unique-ids');
const fs = require('fs').promises;
const path = require('path');

async function createTestTicket() {
  try {
    console.log('🎫 Création d\'un ticket de test...');
    
    // Générer un ID de ticket
    const ticketId = 'manual-' + Math.random().toString(36).substr(2, 9);
    
    // Assigner un ID unique
    const uniqueId = await assignIdToTicket(ticketId);
    
    if (!uniqueId) {
      console.log('❌ Aucun ID unique disponible');
      return;
    }
    
    // Créer le ticket SANS check-in
    const ticket = {
      id: ticketId,
      unique_id: uniqueId,
      name: 'Participant Test',
      email: 'participant@test.sn',
      phone: '+221 77 555 44 33',
      company: 'Entreprise Test',
      fonction: 'Testeur',
      qrcode: `AIK2025-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      checked_in: false, // PAS DE CHECK-IN AUTOMATIQUE
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
      // Fichier n'existe pas
    }
    
    ticketsData.tickets.push(ticket);
    await fs.writeFile(ticketsPath, JSON.stringify(ticketsData, null, 2));
    
    console.log('✅ Ticket créé avec succès !');
    console.log(`   ID Unique: ${uniqueId}`);
    console.log(`   Participant: ${ticket.name}`);
    console.log(`   Statut: En attente (pas de check-in)`);
    
    return { ticketId, uniqueId, ticket };
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return null;
  }
}

// Démarrage du script
if (require.main === module) {
  createTestTicket().catch(error => {
    console.log(`❌ Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}
