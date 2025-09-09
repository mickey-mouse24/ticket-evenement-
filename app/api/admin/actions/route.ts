import { NextRequest, NextResponse } from 'next/server';

const fs = require('fs').promises;
const path = require('path');

const TICKETS_FILE = path.join(process.cwd(), 'data', 'tickets.json');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ticketId, data } = body;

    if (!action || !ticketId) {
      return NextResponse.json({
        success: false,
        message: 'Action et ID de ticket requis'
      }, { status: 400 });
    }

    // Lire le fichier des tickets
    const ticketsData = await fs.readFile(TICKETS_FILE, 'utf8');
    const parsedData = JSON.parse(ticketsData);
    const tickets = parsedData.tickets || [];

    // Trouver l'index du ticket
    const ticketIndex = tickets.findIndex((t: any) => t.id === ticketId);
    
    if (ticketIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Ticket non trouvé'
      }, { status: 404 });
    }

    let message = '';
    let updatedTicket = null;

    switch (action) {
      case 'delete':
        // Supprimer le ticket
        const deletedTicket = tickets.splice(ticketIndex, 1)[0];
        message = `Ticket de ${deletedTicket.name} supprimé avec succès`;
        break;

      case 'toggle_checkin':
        // Basculer le statut de check-in
        const ticket = tickets[ticketIndex];
        ticket.checked_in = !ticket.checked_in;
        ticket.checked_in_at = ticket.checked_in ? new Date().toISOString() : null;
        updatedTicket = ticket;
        message = `Check-in ${ticket.checked_in ? 'activé' : 'désactivé'} pour ${ticket.name}`;
        break;

      case 'update':
        // Mettre à jour les informations du ticket
        if (data) {
          const ticket = tickets[ticketIndex];
          if (data.name) ticket.name = data.name;
          if (data.email) ticket.email = data.email;
          if (data.phone) ticket.phone = data.phone;
          if (data.company) ticket.company = data.company;
          if (data.fonction) ticket.fonction = data.fonction;
          updatedTicket = ticket;
          message = `Ticket de ${ticket.name} mis à jour avec succès`;
        }
        break;

      case 'force_checkin':
        // Forcer le check-in
        const ticketToCheckin = tickets[ticketIndex];
        ticketToCheckin.checked_in = true;
        ticketToCheckin.checked_in_at = new Date().toISOString();
        updatedTicket = ticketToCheckin;
        message = `Check-in forcé pour ${ticketToCheckin.name}`;
        break;

      case 'reset_checkin':
        // Réinitialiser le check-in
        const ticketToReset = tickets[ticketIndex];
        ticketToReset.checked_in = false;
        ticketToReset.checked_in_at = null;
        updatedTicket = ticketToReset;
        message = `Check-in réinitialisé pour ${ticketToReset.name}`;
        break;

      default:
        return NextResponse.json({
          success: false,
          message: 'Action non supportée'
        }, { status: 400 });
    }

    // Sauvegarder les modifications
    await fs.writeFile(TICKETS_FILE, JSON.stringify(parsedData, null, 2));

    return NextResponse.json({
      success: true,
      message,
      ticket: updatedTicket,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur action admin:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// API pour les actions en lot
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ticketIds, data } = body;

    if (!action || !ticketIds || !Array.isArray(ticketIds)) {
      return NextResponse.json({
        success: false,
        message: 'Action et liste des IDs requis'
      }, { status: 400 });
    }

    // Lire le fichier des tickets
    const ticketsData = await fs.readFile(TICKETS_FILE, 'utf8');
    const parsedData = JSON.parse(ticketsData);
    const tickets = parsedData.tickets || [];

    let processedCount = 0;
    let errors = [];

    for (const ticketId of ticketIds) {
      const ticketIndex = tickets.findIndex((t: any) => t.id === ticketId);
      
      if (ticketIndex === -1) {
        errors.push(`Ticket ${ticketId} non trouvé`);
        continue;
      }

      try {
        switch (action) {
          case 'delete':
            tickets.splice(ticketIndex, 1);
            break;
          
          case 'force_checkin':
            tickets[ticketIndex].checked_in = true;
            tickets[ticketIndex].checked_in_at = new Date().toISOString();
            break;
          
          case 'reset_checkin':
            tickets[ticketIndex].checked_in = false;
            tickets[ticketIndex].checked_in_at = null;
            break;
        }
        processedCount++;
      } catch (err) {
        errors.push(`Erreur pour ticket ${ticketId}: ${err}`);
      }
    }

    // Sauvegarder les modifications
    await fs.writeFile(TICKETS_FILE, JSON.stringify(parsedData, null, 2));

    return NextResponse.json({
      success: true,
      message: `${processedCount} tickets traités avec succès`,
      processed: processedCount,
      errors,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur action bulk admin:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
