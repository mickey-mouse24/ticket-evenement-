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
    return { total: 1000, reserved: 0, available: 1000 };
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
      
      // Assigner un ID unique au ticket
      const uniqueId = await assignIdToTicket(ticketId);
      if (!uniqueId) {
        console.log('API: Aucun ID unique disponible');
        return NextResponse.json({ 
          success: false, 
          message: 'Désolé, aucun ID unique disponible. Contactez l\'organisateur.' 
        }, { status: 500 });
      }
      
      const mockReservation = {
        id: ticketId,
        unique_id: uniqueId, // ID unique assigné
        name,
        email,
        phone,
        company,
        fonction: fonction || 'Non spécifié',
        qrcode: `AIK2025-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        checked_in: false,
        created_at: new Date().toISOString()
      };

      console.log('API: Réservation mock créée:', mockReservation);

      // Génération du QR code
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(mockReservation.qrcode, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
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

    // Génération du QR code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrcode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
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