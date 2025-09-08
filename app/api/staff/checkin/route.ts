import { NextRequest, NextResponse } from 'next/server';
import { userQueries, reservationQueries } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

async function checkStaffAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret') as any;
    const user = await userQueries.findById(decoded.userId);
    
    if (!user || !['ADMIN', 'STAFF'].includes(user.role)) {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await checkStaffAuth(request);

    if (!staff) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { qrcode } = body;

    if (!qrcode) {
      return NextResponse.json(
        { error: 'QR code requis' },
        { status: 400 }
      );
    }

    // Chercher la réservation par QR code
    const reservation = await reservationQueries.findByQRCode(qrcode.trim());

    if (!reservation) {
      return NextResponse.json(
        { error: 'QR code invalide ou réservation introuvable' },
        { status: 404 }
      );
    }

    if (reservation.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Cette réservation a été annulée' },
        { status: 400 }
      );
    }

    // Pour cette démo, on simule le check-in réussi
    // Dans un vrai système, vous mettriez à jour une table de check-ins
    return NextResponse.json({
      success: true,
      message: 'Check-in effectué avec succès',
      reservation: {
        ...reservation,
        checkedIn: true,
        checkedInAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors du check-in:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
