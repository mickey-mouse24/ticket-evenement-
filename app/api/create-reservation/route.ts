import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

const fs = require('fs').promises;
const path = require('path');

// Générer un ID unique au format AIK-XXXXXX
function generateUniqueId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'AIK-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Générer un QR code simple
function generateQRCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'AIK2025-';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, fonction } = body;

    // Validation
    if (!name || !email || !phone || !company) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tous les champs sont requis' 
      }, { status: 400 });
    }

    // Générer les IDs
    const ticketId = Math.random().toString(36).substr(2, 9);
    const uniqueId = generateUniqueId();
    const qrCode = generateQRCode();

    // Créer la réservation
    const reservation = {
      id: ticketId,
      unique_id: uniqueId,
      name,
      email,
      phone,
      company,
      fonction: fonction || 'Non spécifié',
      qrcode: uniqueId,  // Utiliser l'ID unique comme QR code
      checked_in: false,
      created_at: new Date().toISOString(),
      checked_in_at: null
    };

    // Sauvegarder dans tickets.json
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    let ticketsData = { tickets: [] };
    
    try {
      const existingData = await fs.readFile(ticketsPath, 'utf8');
      ticketsData = JSON.parse(existingData);
    } catch (error) {
      // Fichier n'existe pas, on utilise la structure par défaut
    }
    
    ticketsData.tickets.push(reservation);
    await fs.writeFile(ticketsPath, JSON.stringify(ticketsData, null, 2));

    // Mettre à jour le fichier unique-ids.json
    const idsPath = path.join(process.cwd(), 'data', 'unique-ids.json');
    let idsData = { 
      total_generated: 0, 
      assigned_count: 0, 
      available_count: 0, 
      ids: [] 
    };
    
    try {
      const existingIds = await fs.readFile(idsPath, 'utf8');
      idsData = JSON.parse(existingIds);
    } catch (error) {
      // Fichier n'existe pas
    }
    
    // Ajouter le nouvel ID unique
    const idObj = {
      id: uniqueId,
      index: idsData.ids.length,
      assigned: true,
      ticket_id: ticketId,
      created_at: new Date().toISOString(),
      assigned_at: new Date().toISOString()
    };
    
    idsData.ids.push(idObj);
    idsData.total_generated = idsData.ids.length;
    idsData.assigned_count = idsData.ids.filter(id => id.assigned).length;
    idsData.available_count = idsData.ids.filter(id => !id.assigned).length;
    
    await fs.writeFile(idsPath, JSON.stringify(idsData, null, 2));

    // Mettre à jour les places
    const placesPath = path.join(process.cwd(), 'data', 'places.json');
    let placesData = { total: 1000, reserved: 0, available: 1000 };
    
    try {
      const existingPlaces = await fs.readFile(placesPath, 'utf8');
      placesData = JSON.parse(existingPlaces);
    } catch (error) {
      // Fichier n'existe pas
    }
    
    placesData.reserved += 1;
    placesData.available = placesData.total - placesData.reserved;
    await fs.writeFile(placesPath, JSON.stringify(placesData, null, 2));

    // Générer un QR code avec données JSON complètes
    const qrData = {
      id: uniqueId,
      ticketId: ticketId,
      name: name,
      email: email,
      phone: phone,
      company: company,
      fonction: fonction || 'Non spécifié',
      event: 'AI-Karangué 2025',
      date: '2025-09-20',
      venue: 'CICAD - DIAMNIADIO',
      timestamp: new Date().toISOString()
    };
    
    const qrDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
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

    return NextResponse.json({
      success: true,
      message: 'Réservation créée avec succès',
      reservation: reservation,
      qr: qrDataURL,
      placesRestantes: placesData.available
    });

  } catch (error) {
    console.error('Erreur création réservation:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
