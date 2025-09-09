-- Script de création des tables pour aikarangue-ticket
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  company VARCHAR(255) NOT NULL,
  fonction VARCHAR(255),
  qrcode VARCHAR(100) UNIQUE NOT NULL,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des places disponibles (pour synchronisation)
CREATE TABLE IF NOT EXISTS event_capacity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL DEFAULT 'AI-Karangué 2025',
  total_places INTEGER NOT NULL DEFAULT 500,
  reserved_places INTEGER NOT NULL DEFAULT 0,
  available_places INTEGER NOT NULL DEFAULT 500,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer la configuration initiale des places si elle n'existe pas
INSERT INTO event_capacity (event_name, total_places, reserved_places, available_places)
SELECT 'AI-Karangué 2025', 500, 0, 500
WHERE NOT EXISTS (SELECT 1 FROM event_capacity WHERE event_name = 'AI-Karangué 2025');

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_reservations_qrcode ON reservations(qrcode);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
CREATE INDEX IF NOT EXISTS idx_reservations_checked_in ON reservations(checked_in);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_capacity ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture et l'écriture pour tous (pour les API publiques)
-- En production, vous devriez restreindre ces politiques
CREATE POLICY IF NOT EXISTS "Allow public read access on reservations" ON reservations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public insert access on reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow public update access on reservations" ON reservations FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access on event_capacity" ON event_capacity FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public update access on event_capacity" ON event_capacity FOR UPDATE USING (true);

-- Fonction pour mettre à jour automatiquement les places disponibles
CREATE OR REPLACE FUNCTION update_available_places()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le nombre de places disponibles
  UPDATE event_capacity 
  SET 
    reserved_places = (SELECT COUNT(*) FROM reservations),
    available_places = total_places - (SELECT COUNT(*) FROM reservations),
    last_updated = NOW()
  WHERE event_name = 'AI-Karangué 2025';
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement les places
DROP TRIGGER IF EXISTS trigger_update_places ON reservations;
CREATE TRIGGER trigger_update_places
  AFTER INSERT OR DELETE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_available_places();

-- Vue pour les statistiques
CREATE OR REPLACE VIEW reservation_stats AS
SELECT 
  COUNT(*) as total_reservations,
  COUNT(*) FILTER (WHERE checked_in = true) as checked_in_count,
  COUNT(*) FILTER (WHERE checked_in = false) as pending_count,
  (SELECT available_places FROM event_capacity WHERE event_name = 'AI-Karangué 2025') as available_places
FROM reservations;
