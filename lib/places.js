// Gestion simple des places disponibles pour le développement
import { promises as fs } from 'fs';
import path from 'path';

const PLACES_FILE = path.join(process.cwd(), 'data', 'places.json');
const TOTAL_PLACES = 500; // Nombre total de places pour l'événement

// Assurer que le répertoire data existe
async function ensureDataDir() {
  const dataDir = path.dirname(PLACES_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialiser le fichier des places s'il n'existe pas
async function initPlaces() {
  await ensureDataDir();
  try {
    await fs.access(PLACES_FILE);
  } catch {
    const initialData = {
      total: TOTAL_PLACES,
      reserved: 0,
      available: TOTAL_PLACES
    };
    await fs.writeFile(PLACES_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Obtenir le nombre de places disponibles
export async function getAvailablePlaces() {
  await initPlaces();
  try {
    const data = await fs.readFile(PLACES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture des places:', error);
    return { total: TOTAL_PLACES, reserved: 0, available: TOTAL_PLACES };
  }
}

// Réserver une place (décrémenter les places disponibles)
export async function reservePlace() {
  await initPlaces();
  try {
    const data = await fs.readFile(PLACES_FILE, 'utf8');
    const places = JSON.parse(data);
    
    if (places.available <= 0) {
      throw new Error('Plus de places disponibles');
    }
    
    places.reserved += 1;
    places.available = places.total - places.reserved;
    
    await fs.writeFile(PLACES_FILE, JSON.stringify(places, null, 2));
    return places;
  } catch (error) {
    console.error('Erreur lors de la réservation:', error);
    throw error;
  }
}

// Reset les places (pour les tests)
export async function resetPlaces() {
  await ensureDataDir();
  const initialData = {
    total: TOTAL_PLACES,
    reserved: 0,
    available: TOTAL_PLACES
  };
  await fs.writeFile(PLACES_FILE, JSON.stringify(initialData, null, 2));
  return initialData;
}
