import { NextRequest, NextResponse } from 'next/server';
import { userQueries, reservationQueries } from '@/lib/supabase';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Nom, email et téléphone sont obligatoires' },
        { status: 400 }
      );
    }

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
      qrcode: `AIK2026-${user.id}-${Date.now()}`,
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

  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
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