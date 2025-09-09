-- Base de données pour la vérification des QR codes AI-Karangué
-- Créer les tables nécessaires

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 500,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des tickets/réservations
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    qr_code VARCHAR(50) UNIQUE NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_phone VARCHAR(20),
    participant_company VARCHAR(255),
    participant_function VARCHAR(255),
    is_valid BOOLEAN DEFAULT true,
    is_checked_in BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_in_at TIMESTAMP NULL,
    checked_in_by VARCHAR(255) NULL
);

-- Table des tentatives de vérification (pour la sécurité)
CREATE TABLE IF NOT EXISTS verification_attempts (
    id SERIAL PRIMARY KEY,
    qr_code VARCHAR(50) NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result VARCHAR(20) NOT NULL, -- 'valid', 'invalid', 'already_used', 'expired'
    ip_address INET,
    user_agent TEXT,
    verified_by VARCHAR(255)
);

-- Table des organisateurs/vérificateurs
CREATE TABLE IF NOT EXISTS verifiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'verifier', -- 'admin', 'verifier'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_qr_code ON verification_attempts(qr_code);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_time ON verification_attempts(attempt_time);

-- Insérer l'événement AI-Karangué par défaut
INSERT INTO events (name, date, location, max_capacity) 
VALUES ('AI-Karangué 2025', '2025-09-20 09:00:00', 'CICAD - DIAMNIADIO', 500)
ON CONFLICT DO NOTHING;

-- Vue pour les statistiques
CREATE OR REPLACE VIEW ticket_stats AS
SELECT 
    e.name as event_name,
    COUNT(t.id) as total_tickets,
    COUNT(CASE WHEN t.is_checked_in = true THEN 1 END) as checked_in,
    COUNT(CASE WHEN t.is_checked_in = false THEN 1 END) as pending,
    COUNT(CASE WHEN t.is_valid = false THEN 1 END) as invalid_tickets,
    e.max_capacity,
    (e.max_capacity - COUNT(t.id)) as remaining_capacity
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id
GROUP BY e.id, e.name, e.max_capacity;

-- Fonction pour vérifier un QR code
CREATE OR REPLACE FUNCTION verify_qr_code(
    p_qr_code VARCHAR(50),
    p_verifier_name VARCHAR(255) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(
    status VARCHAR(20),
    message TEXT,
    ticket_data JSON
) AS $$
DECLARE
    ticket_record RECORD;
    verification_result VARCHAR(20);
    result_message TEXT;
    ticket_json JSON;
BEGIN
    -- Chercher le ticket
    SELECT * INTO ticket_record 
    FROM tickets t 
    JOIN events e ON t.event_id = e.id 
    WHERE t.qr_code = p_qr_code;
    
    -- Vérifier si le ticket existe
    IF NOT FOUND THEN
        verification_result := 'invalid';
        result_message := 'QR Code invalide ou ticket inexistant';
        ticket_json := NULL;
    -- Vérifier si le ticket est valide
    ELSIF NOT ticket_record.is_valid THEN
        verification_result := 'invalid';
        result_message := 'Ticket annulé ou invalide';
        ticket_json := row_to_json(ticket_record);
    -- Vérifier si déjà utilisé
    ELSIF ticket_record.is_checked_in THEN
        verification_result := 'already_used';
        result_message := 'Ticket déjà utilisé le ' || to_char(ticket_record.checked_in_at, 'DD/MM/YYYY à HH24:MI');
        ticket_json := row_to_json(ticket_record);
    -- Vérifier si l'événement est expiré
    ELSIF ticket_record.date < NOW() - INTERVAL '1 day' THEN
        verification_result := 'expired';
        result_message := 'Événement terminé';
        ticket_json := row_to_json(ticket_record);
    -- Ticket valide
    ELSE
        verification_result := 'valid';
        result_message := 'Ticket valide - Participant: ' || ticket_record.participant_name;
        ticket_json := row_to_json(ticket_record);
    END IF;
    
    -- Enregistrer la tentative de vérification
    INSERT INTO verification_attempts (qr_code, result, ip_address, user_agent, verified_by)
    VALUES (p_qr_code, verification_result, p_ip_address, p_user_agent, p_verifier_name);
    
    -- Retourner le résultat
    RETURN QUERY SELECT verification_result, result_message, ticket_json;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour faire le check-in d'un participant
CREATE OR REPLACE FUNCTION checkin_participant(
    p_qr_code VARCHAR(50),
    p_verifier_name VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    ticket_data JSON
) AS $$
DECLARE
    ticket_record RECORD;
    updated_ticket JSON;
BEGIN
    -- Vérifier d'abord le ticket
    SELECT * INTO ticket_record FROM verify_qr_code(p_qr_code, p_verifier_name);
    
    -- Si le ticket n'est pas valide, retourner l'erreur
    IF ticket_record.status != 'valid' THEN
        RETURN QUERY SELECT false, ticket_record.message, ticket_record.ticket_data;
        RETURN;
    END IF;
    
    -- Faire le check-in
    UPDATE tickets 
    SET is_checked_in = true, 
        checked_in_at = CURRENT_TIMESTAMP,
        checked_in_by = p_verifier_name
    WHERE qr_code = p_qr_code;
    
    -- Récupérer le ticket mis à jour
    SELECT row_to_json(t) INTO updated_ticket
    FROM (
        SELECT t.*, e.name as event_name, e.date as event_date, e.location as event_location
        FROM tickets t 
        JOIN events e ON t.event_id = e.id 
        WHERE t.qr_code = p_qr_code
    ) t;
    
    RETURN QUERY SELECT true, 'Check-in réussi!', updated_ticket;
END;
$$ LANGUAGE plpgsql;
