-- Création de la table users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('ADMIN', 'STAFF', 'ATTENDEE')) DEFAULT 'ATTENDEE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  qrcode TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('CONFIRMED', 'CANCELLED')) DEFAULT 'CONFIRMED',
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_qrcode ON reservations(qrcode);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertion des utilisateurs de démonstration
INSERT INTO users (name, email, phone, role) VALUES
  ('Administrateur AIKarangue', 'admin@aikarangue.com', '+33 1 23 45 67 89', 'ADMIN'),
  ('Staff Member', 'staff@aikarangue.com', '+33 1 23 45 67 90', 'STAFF'),
  ('Utilisateur Demo', 'user@aikarangue.com', '+33 1 23 45 67 91', 'ATTENDEE')
ON CONFLICT (email) DO NOTHING;

-- Politiques RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs : peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id::text);

-- Politique pour les admins : accès complet
CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

CREATE POLICY "Admins can update all users" ON users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- Politique pour les réservations : utilisateurs peuvent voir leurs réservations
CREATE POLICY "Users can view own reservations" ON reservations
FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create reservations" ON reservations
FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Politique pour staff/admin : peuvent voir toutes les réservations
CREATE POLICY "Staff can view all reservations" ON reservations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text 
    AND role IN ('ADMIN', 'STAFF')
  )
);

CREATE POLICY "Staff can update reservations" ON reservations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text 
    AND role IN ('ADMIN', 'STAFF')
  )
);

-- Vue pour les statistiques (accessible aux admins)
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM reservations) as total_reservations,
  (SELECT COUNT(*) FROM reservations WHERE status = 'CONFIRMED') as confirmed_reservations,
  (SELECT COUNT(*) FROM reservations WHERE status = 'CANCELLED') as cancelled_reservations,
  (SELECT COUNT(*) FROM reservations WHERE checked_in = true) as checked_in_reservations;
