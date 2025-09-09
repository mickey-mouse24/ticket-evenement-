// Script pour migrer les données JSON vers Supabase
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://spjsuglnqjtdfwdkzvkn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwanN1Z2xucWp0ZGZ3ZGt6dmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzA2NDYsImV4cCI6MjA3MjkwNjY0Nn0._gKb6yt1557Yj0Mv6rt0P5ttxR2NpNYFf4bx3tzKV0A';

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration PostgreSQL directe
const pgConfig = {
  host: 'db.spjsuglnqjtdfwdkzvkn.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'aikarangueticket',
  ssl: { rejectUnauthorized: false }
};

async function migrateTickets() {
  try {
    console.log('🚀 Début de la migration vers Supabase...');
    
    // Lire les données JSON existantes
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    const placesPath = path.join(process.cwd(), 'data', 'places.json');
    
    let ticketsData = { tickets: [] };
    let placesData = { total: 500, reserved: 0, available: 500 };
    
    try {
      const ticketsFile = await fs.readFile(ticketsPath, 'utf8');
      ticketsData = JSON.parse(ticketsFile);
      console.log(`📄 ${ticketsData.tickets.length} tickets trouvés dans le fichier JSON`);
    } catch (error) {
      console.log('📄 Aucun fichier tickets.json trouvé, migration avec données vides');
    }
    
    try {
      const placesFile = await fs.readFile(placesPath, 'utf8');
      placesData = JSON.parse(placesFile);
      console.log(`📊 ${placesData.reserved} places réservées sur ${placesData.total}`);
    } catch (error) {
      console.log('📊 Aucun fichier places.json trouvé, utilisation des valeurs par défaut');
    }
    
    // Migrer les tickets vers Supabase
    if (ticketsData.tickets.length > 0) {
      console.log('📤 Migration des tickets vers Supabase...');
      
      const { data, error } = await supabase
        .from('reservations')
        .insert(ticketsData.tickets.map(ticket => ({
          name: ticket.name,
          email: ticket.email,
          phone: ticket.phone,
          company: ticket.company,
          fonction: ticket.fonction,
          qrcode: ticket.qrcode,
          checked_in: ticket.checked_in,
          checked_in_at: ticket.checked_in_at,
          created_at: ticket.created_at
        })));
      
      if (error) {
        console.error('❌ Erreur lors de la migration des tickets:', error);
      } else {
        console.log('✅ Tickets migrés avec succès vers Supabase');
      }
    }
    
    // Mettre à jour les places disponibles
    console.log('📊 Mise à jour des places disponibles...');
    const { error: capacityError } = await supabase
      .from('event_capacity')
      .update({
        reserved_places: placesData.reserved,
        available_places: placesData.available,
        last_updated: new Date().toISOString()
      })
      .eq('event_name', 'AI-Karangué 2025');
    
    if (capacityError) {
      console.error('❌ Erreur lors de la mise à jour des places:', capacityError);
    } else {
      console.log('✅ Places disponibles mises à jour dans Supabase');
    }
    
    // Vérifier les données migrées
    const { data: reservations, error: fetchError } = await supabase
      .from('reservations')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Erreur lors de la vérification:', fetchError);
    } else {
      console.log(`✅ Vérification: ${reservations.length} réservations dans Supabase`);
    }
    
    console.log('🎉 Migration terminée avec succès !');
    console.log('💡 Vous pouvez maintenant passer en mode production en changeant NODE_ENV=production dans .env.local');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateTickets();
}

module.exports = { migrateTickets };
