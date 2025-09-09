import { NextRequest, NextResponse } from 'next/server';

// Import des fonctions de gestion des IDs
const { isValidId } = require('../../../scripts/generate-unique-ids');

export async function GET() {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Stats des IDs uniques
    const idsPath = path.join(process.cwd(), 'data', 'unique-ids.json');
    const idsData = await fs.readFile(idsPath, 'utf8');
    const uniqueIdsData = JSON.parse(idsData);
    
    // Stats des tickets
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    const ticketsData = await fs.readFile(ticketsPath, 'utf8');
    const { tickets } = JSON.parse(ticketsData);
    
    // Compter les tickets avec unique_id
    const ticketsWithUniqueId = tickets.filter((t: any) => t.unique_id);
    const checkedInWithUniqueId = ticketsWithUniqueId.filter((t: any) => t.checked_in);
    
    const stats = {
      total_unique_ids: uniqueIdsData.total_generated,
      assigned_ids: uniqueIdsData.assigned_count,
      available_ids: uniqueIdsData.available_count,
      tickets_with_unique_id: ticketsWithUniqueId.length,
      checked_in_unique_ids: checkedInWithUniqueId.length,
      pending_unique_ids: ticketsWithUniqueId.length - checkedInWithUniqueId.length,
      usage_rate: uniqueIdsData.total_generated > 0 ? 
        ((uniqueIdsData.assigned_count / uniqueIdsData.total_generated) * 100).toFixed(1) : '0.0'
    };
    
    return NextResponse.json({ 
      success: true, 
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur GET verify-unique-id:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors de la récupération des statistiques',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { uniqueId, action } = body;

    if (!uniqueId || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID unique et action requis' 
      }, { status: 400 });
    }

    // Traitement des données QR : peut être un JSON ou un simple ID
    let extractedId = uniqueId;
    let qrData = null;
    
    try {
      // Essayer de parser comme JSON (nouveau format)
      qrData = JSON.parse(uniqueId);
      extractedId = qrData.id || qrData.ticketId || qrData.unique_id;
      
      if (!extractedId) {
        // Chercher dans les propriétés communes
        const possibleIds = Object.values(qrData).filter(val => 
          typeof val === 'string' && val.startsWith('AIK-') && val.length === 10
        );
        if (possibleIds.length > 0) {
          extractedId = possibleIds[0];
        }
      }
    } catch (e) {
      // Ce n'est pas du JSON, traiter comme un ID simple
      extractedId = uniqueId.trim().toUpperCase();
    }
    
    if (!extractedId || !extractedId.startsWith('AIK-')) {
      return NextResponse.json({
        success: false,
        status: 'invalid',
        message: `Format d'ID invalide. ID extrait: "${extractedId}"`,
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier si l'ID existe dans notre système
    const idInfo = await isValidId(extractedId);
    
    if (!idInfo) {
      return NextResponse.json({
        success: false,
        status: 'invalid',
        message: `ID "${uniqueId}" non reconnu ou invalide`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (!idInfo.assigned) {
      return NextResponse.json({
        success: false,
        status: 'not_assigned',
        message: `ID "${uniqueId}" valide mais non assigné à un ticket`,
        timestamp: new Date().toISOString()
      });
    }
    
    // L'ID est assigné, chercher le ticket correspondant
    const fs = require('fs').promises;
    const path = require('path');
    
    const ticketsPath = path.join(process.cwd(), 'data', 'tickets.json');
    const ticketsData = await fs.readFile(ticketsPath, 'utf8');
    const data = JSON.parse(ticketsData);
    
    // Chercher le ticket par unique_id extrait
    const ticketIndex = data.tickets.findIndex((t: any) => t.unique_id === extractedId);
    
    if (ticketIndex === -1) {
      return NextResponse.json({
        success: false,
        status: 'invalid',
        message: `Ticket associé à l'ID "${extractedId}" non trouvé`,
        timestamp: new Date().toISOString()
      });
    }
    
    const ticket = data.tickets[ticketIndex];
    
    if (action === 'verify') {
      // Vérifier si le ticket a déjà été utilisé
      if (ticket.checked_in) {
        return NextResponse.json({
          success: false,
          status: 'used',
          message: `ID "${extractedId}" déjà utilisé le ${new Date(ticket.checked_in_at).toLocaleString('fr-FR')}`,
          id: extractedId,
          originalInput: uniqueId,
          qrData: qrData,
          ticket,
          timestamp: new Date().toISOString()
        });
      }
      
      // ID valide et ticket disponible
      return NextResponse.json({
        success: true,
        status: 'valid',
        message: `ID "${extractedId}" valide - Participant: ${ticket.name}`,
        id: extractedId,
        originalInput: uniqueId,
        qrData: qrData,
        ticket,
        timestamp: new Date().toISOString()
      });
      
    } else if (action === 'checkin') {
      // Vérifier si déjà utilisé
      if (ticket.checked_in) {
        return NextResponse.json({
          success: false,
          status: 'used',
          message: `ID "${extractedId}" déjà utilisé le ${new Date(ticket.checked_in_at).toLocaleString('fr-FR')}`,
          id: extractedId,
          originalInput: uniqueId,
          qrData: qrData,
          ticket,
          timestamp: new Date().toISOString()
        });
      }
      
      // Faire le check-in
      data.tickets[ticketIndex].checked_in = true;
      data.tickets[ticketIndex].checked_in_at = new Date().toISOString();
      
      // Sauvegarder
      await fs.writeFile(ticketsPath, JSON.stringify(data, null, 2));
      
      return NextResponse.json({
        success: true,
        status: 'valid',
        message: `Check-in réussi pour l'ID "${extractedId}" - Participant: ${ticket.name}`,
        id: extractedId,
        originalInput: uniqueId,
        qrData: qrData,
        ticket: data.tickets[ticketIndex],
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Action invalide. Utilisez "verify" ou "checkin"' 
    }, { status: 400 });

  } catch (error) {
    console.error('Erreur API verify-unique-id:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}