import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';
import { addValidTicket } from '@/lib/tickets';
// Import de la fonction d'assignation d'ID
const { assignIdToTicket } = require('../../../scripts/generate-unique-ids');

// Import direct des fonctions de gestion des places
const fs = require('fs').promises;
const path = require('path');

const PLACES_FILE = path.join(process.cwd(), 'data', 'places.json');

async function getAvailablePlaces() {
  try {
    const data = await fs.readFile(PLACES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture des places:', error);
    return { total: 500, reserved: 0, available: 500 };
  }
}

async function reservePlace() {
  try {
    const data = await fs.readFile(PLACES_FILE, 'utf8');
    const places = JSON.parse(data);
    
    if (places.available <= 0) {
      throw new Error('Plus de places disponibles');
    }
    
    places.reserved += 1;
    places.available = places.total - places.reserved;
    
    await fs.writeFile(PLACES_FILE, JSON.stringify(places, null, 2));
    return places;
  } catch (error) {
    console.error('Erreur lors de la réservation:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API: Début de la requête POST');
    
    const body = await request.json();
    console.log('API: Body reçu:', body);

    const { name, email, phone, company, fonction } = body;

    // Validation des champs requis
    if (!name || !email || !phone || !company) {
      console.log('API: Champs manquants');
      return NextResponse.json({ 
        success: false, 
        message: 'Tous les champs sont requis' 
      }, { status: 400 });
    }

    console.log('API: Validation réussie');

    // Vérifier les places disponibles
    const placesInfo = await getAvailablePlaces();
    if (placesInfo.available <= 0) {
      console.log('API: Plus de places disponibles');
      return NextResponse.json({ 
        success: false, 
        message: 'Désolé, il n\'y a plus de places disponibles pour cet événement.' 
      }, { status: 400 });
    }

    console.log(`API: ${placesInfo.available} places disponibles`);

    // Mode développement - génération de données mock
    if (process.env.NODE_ENV === 'development') {
      console.log('API: Mode développement - génération de données mock');
      
      const ticketId = Math.random().toString(36).substr(2, 9);
      
      // Assigner un ID unique au ticket (ou en générer un dynamiquement)
      let uniqueId = await assignIdToTicket(ticketId);
      if (!uniqueId) {
        // Si aucun ID pré-généré disponible, créer un dynamiquement
        console.log('API: Aucun ID pré-généré disponible, génération dynamique');
        uniqueId = `AIK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        console.log(`API: ID unique généré dynamiquement: ${uniqueId}`);
        
        // Enregistrer l'ID dynamique dans unique-ids.json
        try {
          const idsPath = path.join(process.cwd(), 'data', 'unique-ids.json');
          let idsData = { 
            total_generated: 0, 
            assigned_count: 0, 
            available_count: 0, 
            generated_at: new Date().toISOString(),
            ids: [] 
          };
          
          try {
            const existingIds = await fs.readFile(idsPath, 'utf8');
            idsData = JSON.parse(existingIds);
          } catch (error) {
            // Fichier n'existe pas, utiliser les données par défaut
          }
          
          // Ajouter le nouvel ID généré dynamiquement
          const idObj = {
            id: uniqueId,
            index: idsData.ids.length + 1,
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
          console.log(`API: ID unique ${uniqueId} enregistré dans unique-ids.json`);
        } catch (saveError) {
          console.error('API: Erreur sauvegarde ID unique:', saveError);
          // Continuer même si la sauvegarde échoue
        }
      }
      
      const mockReservation = {
        id: ticketId,
        unique_id: uniqueId, // ID unique assigné
        name,
        email,
        phone,
        company,
        fonction: fonction || 'Non spécifié',
        qrcode: uniqueId, // Utiliser directement l'ID unique
        checked_in: false,
        created_at: new Date().toISOString()
      };

      console.log('API: Réservation mock créée:', mockReservation);

      // Génération du QR code avec données JSON complètes
      try {
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
        
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          width: 256
        });

        console.log('API: QR code généré avec succès');

        // Décrémenter les places disponibles
        const updatedPlaces = await reservePlace();
        console.log(`API: Place réservée. Places restantes: ${updatedPlaces.available}`);

        // Ajouter le ticket à la base de données pour vérification
        await addValidTicket(mockReservation);
        console.log(`API: Ticket ajouté à la base de vérification`);

        return NextResponse.json({
          success: true,
          reservation: mockReservation,
          qr: qrCodeDataUrl,
          placesRestantes: updatedPlaces.available
        });
      } catch (qrError) {
        console.error('API: Erreur génération QR code:', qrError);
        return NextResponse.json({
          success: false,
          message: 'Erreur lors de la génération du QR code'
        }, { status: 500 });
      }
    }

    // Mode production - utilisation de Supabase
    console.log('API: Mode production - utilisation de Supabase');

    const qrcode = `AIK2025-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert([
        {
          name,
          email,
          phone,
          company,
          fonction: fonction || 'Non spécifié',
          qrcode,
          checked_in: false,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('API: Erreur Supabase:', error);
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de la création de la réservation'
      }, { status: 500 });
    }

    console.log('API: Réservation créée avec succès:', reservation);

    // Génération du QR code avec données JSON complètes
    try {
      const qrData = {
        id: qrcode,
        ticketId: reservation.id,
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
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 256
      });

      console.log('API: QR code généré avec succès');

      // Décrémenter les places disponibles
      const updatedPlaces = await reservePlace();
      console.log(`API: Place réservée. Places restantes: ${updatedPlaces.available}`);

      // Ajouter le ticket à la base de données pour vérification
      await addValidTicket(reservation);
      console.log(`API: Ticket ajouté à la base de vérification`);

      return NextResponse.json({
        success: true,
        reservation,
        qr: qrCodeDataUrl,
        placesRestantes: updatedPlaces.available
      });
    } catch (qrError) {
      console.error('API: Erreur génération QR code:', qrError);
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de la génération du QR code'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API: Erreur générale:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('API GET: Début de la requête GET');
    const placesInfo = await getAvailablePlaces();
    console.log('API GET: Places info:', placesInfo);
    
    const response = {
      success: true,
      places: placesInfo
    };
    
    console.log('API GET: Réponse:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('API GET: Erreur lors de la récupération des places:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la récupération des places disponibles'
    }, { status: 500 });
  }
}