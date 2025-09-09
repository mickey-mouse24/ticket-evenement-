import { NextResponse } from 'next/server';

const fs = require('fs').promises;
const path = require('path');

const TICKETS_FILE = path.join(process.cwd(), 'data', 'tickets.json');

export async function GET() {
  try {
    // Lire le fichier des tickets
    const data = await fs.readFile(TICKETS_FILE, 'utf8');
    const ticketsData = JSON.parse(data);
    
    // Calculer des statistiques détaillées
    const tickets = ticketsData.tickets || [];
    
    const stats = {
      total: tickets.length,
      checked_in: tickets.filter((t: any) => t.checked_in).length,
      pending: tickets.filter((t: any) => !t.checked_in).length,
      
      // Statistiques par date
      today: tickets.filter((t: any) => {
        const ticketDate = new Date(t.created_at);
        const today = new Date();
        return ticketDate.toDateString() === today.toDateString();
      }).length,
      
      // Statistiques par fonction
      functions: tickets.reduce((acc: any, ticket: any) => {
        const func = ticket.fonction || 'Non spécifié';
        acc[func] = (acc[func] || 0) + 1;
        return acc;
      }, {}),
      
      // Statistiques par entreprise
      companies: tickets.reduce((acc: any, ticket: any) => {
        const company = ticket.company || 'Non spécifié';
        acc[company] = (acc[company] || 0) + 1;
        return acc;
      }, {}),
      
      // Check-ins récents (dernières 24h)
      recent_checkins: tickets.filter((t: any) => {
        if (!t.checked_in_at) return false;
        const checkinDate = new Date(t.checked_in_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - checkinDate.getTime()) / (1000 * 3600);
        return hoursDiff <= 24;
      }).length,
      
      // Taux de participation
      attendance_rate: tickets.length > 0 
        ? ((tickets.filter((t: any) => t.checked_in).length / tickets.length) * 100).toFixed(1)
        : '0.0'
    };
    
    return NextResponse.json({
      success: true,
      tickets,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur lecture tickets:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la récupération des tickets',
      tickets: [],
      stats: {
        total: 0,
        checked_in: 0,
        pending: 0,
        today: 0,
        functions: {},
        companies: {},
        recent_checkins: 0,
        attendance_rate: '0.0'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
