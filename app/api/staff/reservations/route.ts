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

export async function GET(request: NextRequest) {
  try {
    const staff = await checkStaffAuth(request);

    if (!staff) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const allReservations = await reservationQueries.findAllWithUsers();
    const reservations = allReservations.filter(r => r.status === 'CONFIRMED');

    // Ajouter des données de check-in simulées pour la démo
    const reservationsWithCheckin = reservations.map((reservation, index) => ({
      ...reservation,
      checkedIn: index < 3, // Les 3 premières sont check-in pour la démo
      checkedInAt: index < 3 ? new Date(Date.now() - (index * 3600000)).toISOString() : null
    }));

    return NextResponse.json({ reservations: reservationsWithCheckin });

  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
