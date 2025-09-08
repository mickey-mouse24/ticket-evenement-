import { NextRequest, NextResponse } from 'next/server';
import { userQueries, reservationQueries } from '@/lib/supabase';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    console.log('API POST /reservations appelée');
    const body = await request.json();
    console.log('Body reçu:', body);
    const { name, email, phone, company } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Nom, email et téléphone sont obligatoires' },
        { status: 400 }
      );
    }

    // En mode développement, créer une réservation factice
    if (process.env.NODE_ENV === 'development') {
      console.log('Mode développement: création d\'une réservation factice');
      
      const mockReservation = {
        id: `DEV-${Date.now()}`,
        qrcode: `AIK2025-DEV-${Date.now()}`,
        status: 'CONFIRMED'
      };

      // Générer le QR code
      const qrCodeDataUrl = await QRCode.toDataURL(mockReservation.qrcode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return NextResponse.json({
        success: true,
        reservation: mockReservation,
        qr: qrCodeDataUrl
      });
    }

    // Code de production avec Supabase
    try {
      // Vérifier si l'utilisateur existe déjà
      let user = await userQueries.findByEmail(email);

      if (!user) {
        // Créer un nouvel utilisateur
        user = await userQueries.create({
          name,
          email,
          phone,
          role: 'ATTENDEE'
        });
      }

      // Vérifier si l'utilisateur a déjà une réservation
      const existingReservations = await reservationQueries.findByUserId(user.id);

      if (existingReservations && existingReservations.length > 0) {
        return NextResponse.json(
          { error: 'Vous avez déjà une réservation' },
          { status: 400 }
        );
      }

      // Créer la réservation
      const reservation = await reservationQueries.create({
        user_id: user.id,
        qrcode: `AIK2025-${user.id}-${Date.now()}`,
        status: 'CONFIRMED'
      });

      // Générer le QR code
      const qrCodeDataUrl = await QRCode.toDataURL(reservation.qrcode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return NextResponse.json({
        success: true,
        reservation: {
          id: reservation.id,
          qrcode: reservation.qrcode,
          status: reservation.status
        },
        qr: qrCodeDataUrl
      });
    } catch (supabaseError) {
      console.error('Erreur Supabase:', supabaseError);
      throw supabaseError;
    }

  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reservations = await reservationQueries.findAllWithUsers();
    return NextResponse.json({ reservations });

  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}