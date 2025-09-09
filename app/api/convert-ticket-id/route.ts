import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de ticket requis' 
      }, { status: 400 });
    }

    const fs = require('fs').promises;
    const path = require('path');
    
    // Lire les tickets
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    const ticketsData = await fs.readFile(ticketsPath, 'utf8');
    const { tickets } = JSON.parse(ticketsData);
    
    // Chercher le ticket par son ancien ID
    const ticket = tickets.find((t: any) => t.id === ticketId);
    
    if (!ticket) {
      return NextResponse.json({
        success: false,
        message: `Ticket avec l'ID "${ticketId}" non trouvé`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (!ticket.unique_id) {
      return NextResponse.json({
        success: false,
        message: `Ticket "${ticketId}" n'a pas d'ID unique assigné`,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      ticketId: ticketId,
      uniqueId: ticket.unique_id,
      participant: {
        name: ticket.name,
        email: ticket.email,
        company: ticket.company
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API convert-ticket-id:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
