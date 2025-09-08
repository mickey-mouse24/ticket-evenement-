import { NextRequest, NextResponse } from 'next/server';
import { userQueries } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

async function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret') as any;
    const user = await userQueries.findById(decoded.userId);
    
    if (user?.role !== 'ADMIN') {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdminAuth(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const users = await userQueries.findAll();

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
