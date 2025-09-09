// Gestion des tickets pour la vérification QR
import { promises as fs } from 'fs';
import path from 'path';

const TICKETS_FILE = path.join(process.cwd(), 'data', 'tickets.json');

// Assurer que le répertoire data existe
async function ensureDataDir() {
  const dataDir = path.dirname(TICKETS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialiser le fichier des tickets s'il n'existe pas
async function initTickets() {
  await ensureDataDir();
  try {
    await fs.access(TICKETS_FILE);
  } catch {
    const initialData = {
      tickets: []
    };
    await fs.writeFile(TICKETS_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Ajouter un ticket valide à la base de données
export async function addValidTicket(ticketData) {
  await initTickets();
  try {
    const data = await fs.readFile(TICKETS_FILE, 'utf8');
    const tickets = JSON.parse(data);
    
    const ticket = {
      id: ticketData.id,
      unique_id: ticketData.unique_id,  // Ajouter le unique_id
      qrcode: ticketData.qrcode,
      name: ticketData.name,
      email: ticketData.email,
      phone: ticketData.phone,
      company: ticketData.company,
      fonction: ticketData.fonction,
      checked_in: false,
      created_at: ticketData.created_at || new Date().toISOString(),
      checked_in_at: null
    };
    
    tickets.tickets.push(ticket);
    await fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2));
    
    return ticket;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du ticket:', error);
    throw error;
  }
}

// Vérifier si un QR code est valide
export async function verifyQRCode(qrcode) {
  await initTickets();
  try {
    const data = await fs.readFile(TICKETS_FILE, 'utf8');
    const tickets = JSON.parse(data);
    
    const ticket = tickets.tickets.find(t => t.qrcode === qrcode);
    
    if (!ticket) {
      return {
        valid: false,
        message: 'QR Code invalide ou ticket non trouvé',
        ticket: null
      };
    }
    
    if (ticket.checked_in) {
      return {
        valid: false,
        message: 'Ce ticket a déjà été utilisé',
        ticket: ticket,
        already_used: true
      };
    }
    
    return {
      valid: true,
      message: 'Ticket valide',
      ticket: ticket
    };
    
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    throw error;
  }
}

// Marquer un ticket comme utilisé (check-in)
export async function checkInTicket(qrcode) {
  await initTickets();
  try {
    const data = await fs.readFile(TICKETS_FILE, 'utf8');
    const tickets = JSON.parse(data);
    
    const ticketIndex = tickets.tickets.findIndex(t => t.qrcode === qrcode);
    
    if (ticketIndex === -1) {
      return {
        success: false,
        message: 'Ticket non trouvé'
      };
    }
    
    if (tickets.tickets[ticketIndex].checked_in) {
      return {
        success: false,
        message: 'Ticket déjà utilisé',
        ticket: tickets.tickets[ticketIndex]
      };
    }
    
    tickets.tickets[ticketIndex].checked_in = true;
    tickets.tickets[ticketIndex].checked_in_at = new Date().toISOString();
    
    await fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2));
    
    return {
      success: true,
      message: 'Check-in réussi',
      ticket: tickets.tickets[ticketIndex]
    };
    
  } catch (error) {
    console.error('Erreur lors du check-in:', error);
    throw error;
  }
}

// Obtenir tous les tickets
export async function getAllTickets() {
  await initTickets();
  try {
    const data = await fs.readFile(TICKETS_FILE, 'utf8');
    const tickets = JSON.parse(data);
    return tickets.tickets;
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    return [];
  }
}

// Obtenir les statistiques des tickets
export async function getTicketStats() {
  const tickets = await getAllTickets();
  
  const total = tickets.length;
  const checkedIn = tickets.filter(t => t.checked_in).length;
  const pending = total - checkedIn;
  
  return {
    total,
    checked_in: checkedIn,
    pending
  };
}
