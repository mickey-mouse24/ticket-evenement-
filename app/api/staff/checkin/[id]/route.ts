import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function checkStaffAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user || !['ADMIN', 'STAFF'].includes(user.role)) {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staff = await checkStaffAuth(request);

    if (!staff) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Chercher la réservation par ID
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      );
    }

    if (reservation.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Cette réservation a été annulée' },
        { status: 400 }
      );
    }

    // Pour cette démo, on simule le check-in manuel réussi
    return NextResponse.json({
      success: true,
      message: 'Check-in manuel effectué avec succès',
      reservation: {
        ...reservation,
        checkedIn: true,
        checkedInAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors du check-in manuel:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
