import { NextRequest, NextResponse } from 'next/server';
import { userQueries } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Comptes de démonstration
    const demoAccounts = [
      { email: 'admin@aikarangue.com', password: 'admin123', role: 'ADMIN', name: 'Administrateur' },
      { email: 'staff@aikarangue.com', password: 'staff123', role: 'STAFF', name: 'Staff Member' },
      { email: 'user@aikarangue.com', password: 'user123', role: 'ATTENDEE', name: 'Utilisateur Demo' }
    ];

    const demoAccount = demoAccounts.find(acc => acc.email === email && acc.password === password);
    
    if (demoAccount) {
      // Créer ou mettre à jour l'utilisateur demo
      let user = await userQueries.findByEmail(demoAccount.email);

      if (!user) {
        user = await userQueries.create({
          name: demoAccount.name,
          email: demoAccount.email,
          phone: '+33 1 23 45 67 89',
          role: demoAccount.role as any
        });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'demo-secret',
        { expiresIn: '24h' }
      );

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

      // Définir le cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400 // 24 heures
      });

      return response;
    }

    // Vérification normale pour les utilisateurs enregistrés
    const user = await userQueries.findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Pour cette démo, on accepte n'importe quel mot de passe pour les utilisateurs existants
    // Dans un vrai système, vous utiliseriez bcrypt.compare
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400
    });

    return response;

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
