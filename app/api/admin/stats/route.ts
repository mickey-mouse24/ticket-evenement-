import { NextResponse } from 'next/server';

const fs = require('fs').promises;
const path = require('path');

const TICKETS_FILE = path.join(process.cwd(), 'data', 'tickets.json');
const PLACES_FILE = path.join(process.cwd(), 'data', 'places.json');
const UNIQUE_IDS_FILE = path.join(process.cwd(), 'data', 'unique-ids.json');

export async function GET() {
  try {
    // Lire tous les fichiers de données
    const [ticketsRaw, placesRaw, uniqueIdsRaw] = await Promise.all([
      fs.readFile(TICKETS_FILE, 'utf8').catch(() => '{"tickets":[]}'),
      fs.readFile(PLACES_FILE, 'utf8').catch(() => '{"total":500,"reserved":0,"available":500}'),
      fs.readFile(UNIQUE_IDS_FILE, 'utf8').catch(() => '{"total_generated":0,"assigned_count":0,"available_count":0,"ids":[]}')
    ]);

    const ticketsData = JSON.parse(ticketsRaw);
    const placesData = JSON.parse(placesRaw);
    const uniqueIdsData = JSON.parse(uniqueIdsRaw);

    const tickets = ticketsData.tickets || [];
    
    // Statistiques générales
    const totalTickets = tickets.length;
    const checkedInTickets = tickets.filter((t: any) => t.checked_in).length;
    const pendingTickets = totalTickets - checkedInTickets;
    
    // Statistiques par période
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const ticketsToday = tickets.filter((t: any) => {
      const ticketDate = new Date(t.created_at);
      return ticketDate >= today;
    }).length;
    
    const checkinsToday = tickets.filter((t: any) => {
      if (!t.checked_in_at) return false;
      const checkinDate = new Date(t.checked_in_at);
      return checkinDate >= today;
    }).length;
    
    const ticketsThisWeek = tickets.filter((t: any) => {
      const ticketDate = new Date(t.created_at);
      return ticketDate >= thisWeek;
    }).length;
    
    // Top entreprises
    const companiesStats = tickets.reduce((acc: any, ticket: any) => {
      const company = ticket.company || 'Non spécifié';
      if (!acc[company]) {
        acc[company] = { total: 0, checked_in: 0 };
      }
      acc[company].total++;
      if (ticket.checked_in) {
        acc[company].checked_in++;
      }
      return acc;
    }, {});
    
    const topCompanies = Object.entries(companiesStats)
      .map(([name, data]: [string, any]) => ({
        name,
        total: data.total,
        checked_in: data.checked_in,
        rate: data.total > 0 ? ((data.checked_in / data.total) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    
    // Top fonctions
    const functionsStats = tickets.reduce((acc: any, ticket: any) => {
      const func = ticket.fonction || 'Non spécifié';
      acc[func] = (acc[func] || 0) + 1;
      return acc;
    }, {});
    
    const topFunctions = Object.entries(functionsStats)
      .map(([name, count]: [string, any]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Évolution par jour (7 derniers jours)
    const dailyEvolution = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const dayTickets = tickets.filter((t: any) => {
        const ticketDate = new Date(t.created_at);
        return ticketDate >= date && ticketDate < nextDate;
      }).length;
      
      const dayCheckins = tickets.filter((t: any) => {
        if (!t.checked_in_at) return false;
        const checkinDate = new Date(t.checked_in_at);
        return checkinDate >= date && checkinDate < nextDate;
      }).length;
      
      dailyEvolution.push({
        date: date.toISOString().split('T')[0],
        tickets: dayTickets,
        checkins: dayCheckins
      });
    }
    
    // Horaires de pointe pour les check-ins
    const hourlyCheckins = new Array(24).fill(0);
    tickets.forEach((ticket: any) => {
      if (ticket.checked_in_at) {
        const hour = new Date(ticket.checked_in_at).getHours();
        hourlyCheckins[hour]++;
      }
    });
    
    const peakHours = hourlyCheckins
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const stats = {
      // Métriques principales
      overview: {
        total_tickets: totalTickets,
        checked_in: checkedInTickets,
        pending: pendingTickets,
        attendance_rate: totalTickets > 0 ? ((checkedInTickets / totalTickets) * 100).toFixed(1) : '0.0',
        
        // Places
        total_places: placesData.total || 500,
        available_places: placesData.available || 0,
        reserved_places: placesData.reserved || 0,
        occupation_rate: placesData.total > 0 ? 
          (((placesData.reserved || 0) / placesData.total) * 100).toFixed(1) : '0.0',
        
        // IDs uniques
        unique_ids_generated: uniqueIdsData.total_generated || 0,
        unique_ids_assigned: uniqueIdsData.assigned_count || 0,
        unique_ids_available: uniqueIdsData.available_count || 0,
      },
      
      // Activité récente
      activity: {
        tickets_today: ticketsToday,
        checkins_today: checkinsToday,
        tickets_this_week: ticketsThisWeek,
        recent_checkins: tickets.filter((t: any) => {
          if (!t.checked_in_at) return false;
          const checkinDate = new Date(t.checked_in_at);
          const hoursAgo = (now.getTime() - checkinDate.getTime()) / (1000 * 3600);
          return hoursAgo <= 2; // 2 dernières heures
        }).length
      },
      
      // Analyses
      analytics: {
        top_companies: topCompanies,
        top_functions: topFunctions,
        daily_evolution: dailyEvolution,
        peak_hours: peakHours,
        hourly_checkins: hourlyCheckins
      },
      
      // Métadonnées
      metadata: {
        last_updated: new Date().toISOString(),
        data_freshness: 'real-time',
        total_records_processed: totalTickets
      }
    };
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur calcul statistiques:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du calcul des statistiques',
      stats: null,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
