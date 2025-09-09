# Configuration Supabase pour AI-Karangué Ticket

## 📋 Informations du Projet

- **Nom du projet**: aikarangue-ticket
- **URL**: https://spjsuglnqjtdfwdkzvkn.supabase.co
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwanN1Z2xucWp0ZGZ3ZGt6dmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzA2NDYsImV4cCI6MjA3MjkwNjY0Nn0._gKb6yt1557Yj0Mv6rt0P5ttxR2NpNYFf4bx3tzKV0A`
- **PostgreSQL URL**: `postgresql://postgres:aikarangueticket@db.spjsuglnqjtdfwdkzvkn.supabase.co:5432/postgres`
- **Database Password**: `aikarangueticket`

## 🚀 Étapes de Configuration

### 1. Configuration des Variables d'Environnement

Le fichier `.env.local` a été créé avec les bonnes variables :

```env
NEXT_PUBLIC_SUPABASE_URL=https://spjsuglnqjtdfwdkzvkn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwanN1Z2xucWp0ZGZ3ZGt6dmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzA2NDYsImV4cCI6MjA3MjkwNjY0Nn0._gKb6yt1557Yj0Mv6rt0P5ttxR2NpNYFf4bx3tzKV0A

# Connexion PostgreSQL directe
DATABASE_URL=postgresql://postgres:aikarangueticket@db.spjsuglnqjtdfwdkzvkn.supabase.co:5432/postgres
DB_PASSWORD=aikarangueticket

NODE_ENV=development
```

### 2. Création des Tables dans Supabase

1. Connectez-vous à votre dashboard Supabase : https://app.supabase.com
2. Ouvrez votre projet `aikarangue-ticket`
3. Allez dans l'onglet "SQL Editor"
4. Copiez et exécutez le contenu du fichier `scripts/setup-supabase.sql`

Ce script créera :
- ✅ Table `reservations` (réservations des participants)
- ✅ Table `event_capacity` (gestion des places disponibles)
- ✅ Vue `reservation_stats` (statistiques)
- ✅ Triggers automatiques pour la synchronisation
- ✅ Index pour les performances
- ✅ Politiques RLS pour la sécurité

### 3. Migration des Données Existantes (Optionnel)

Si vous avez déjà des données dans les fichiers JSON locaux :

```bash
node scripts/migrate-to-supabase.js
```

### 4. Passage en Mode Production

Pour utiliser Supabase au lieu des fichiers JSON locaux :

1. Modifiez `.env.local` :
```env
NODE_ENV=production
```

2. Redémarrez le serveur :
```bash
npm run dev
```

## 🗄️ Connexion PostgreSQL Directe

Vous pouvez vous connecter directement à la base de données PostgreSQL :

### URL de Connexion
```
postgresql://postgres:aikarangueticket@db.spjsuglnqjtdfwdkzvkn.supabase.co:5432/postgres
```

### Avec psql (ligne de commande)
```bash
psql "postgresql://postgres:aikarangueticket@db.spjsuglnqjtdfwdkzvkn.supabase.co:5432/postgres"
```

### Avec des clients GUI
- **pgAdmin** : Utilisez les paramètres ci-dessus
- **DBeaver** : Créez une nouvelle connexion PostgreSQL
- **DataGrip** : Configurez une source de données PostgreSQL

### Paramètres de Connexion
- **Host** : `db.spjsuglnqjtdfwdkzvkn.supabase.co`
- **Port** : `5432`
- **Database** : `postgres`
- **Username** : `postgres`
- **Password** : `aikarangueticket`

## 📊 Structure des Tables

### Table `reservations`
```sql
- id (UUID, Primary Key)
- name (VARCHAR, Nom du participant)
- email (VARCHAR, Email)
- phone (VARCHAR, Téléphone)
- company (VARCHAR, Structure/Entreprise)
- fonction (VARCHAR, Fonction)
- qrcode (VARCHAR, Code QR unique)
- checked_in (BOOLEAN, Statut check-in)
- checked_in_at (TIMESTAMP, Date/heure check-in)
- created_at (TIMESTAMP, Date création)
```

### Table `event_capacity`
```sql
- id (UUID, Primary Key)
- event_name (VARCHAR, Nom événement)
- total_places (INTEGER, Places totales)
- reserved_places (INTEGER, Places réservées)
- available_places (INTEGER, Places disponibles)
- last_updated (TIMESTAMP, Dernière mise à jour)
```

## 🔧 Fonctionnalités Automatiques

- **Synchronisation automatique** des places disponibles
- **Triggers** pour mettre à jour les compteurs
- **Vue statistiques** pour les dashboards
- **Index optimisés** pour les performances
- **Sécurité RLS** configurée

## 🧪 Test de la Configuration

1. Créez une réservation sur http://localhost:3000/reserve
2. Vérifiez dans Supabase que les données apparaissent
3. Testez la vérification sur http://localhost:3000/verify
4. Vérifiez que les places diminuent automatiquement

## 📱 URLs Importantes

- **Dashboard Supabase** : https://app.supabase.com
- **Projet** : https://app.supabase.com/project/spjsuglnqjtdfwdkzvkn
- **Table Editor** : https://app.supabase.com/project/spjsuglnqjtdfwdkzvkn/editor
- **SQL Editor** : https://app.supabase.com/project/spjsuglnqjtdfwdkzvkn/sql

## 🔐 Sécurité

- Les clés API sont configurées pour l'accès public (nécessaire pour les formulaires)
- RLS est activé avec des politiques permissives
- En production, vous devriez restreindre les politiques selon vos besoins

## 🛠️ Scripts Utiles

### Tester la connexion PostgreSQL
```bash
node scripts/test-postgres-connection.js
```

### Migrer les données JSON vers Supabase
```bash
node scripts/migrate-to-supabase.js
```

### Se connecter en ligne de commande
```bash
psql "postgresql://postgres:aikarangueticket@db.spjsuglnqjtdfwdkzvkn.supabase.co:5432/postgres"
```

### Requêtes SQL utiles

**Voir toutes les réservations :**
```sql
SELECT name, email, company, qrcode, checked_in, created_at 
FROM reservations 
ORDER BY created_at DESC;
```

**Statistiques rapides :**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE checked_in = true) as checked_in,
  COUNT(*) FILTER (WHERE checked_in = false) as pending
FROM reservations;
```

**Places disponibles :**
```sql
SELECT * FROM event_capacity WHERE event_name = 'AI-Karangué 2025';
```

## 🆘 Dépannage

- Si les tables n'existent pas, exécutez `scripts/setup-supabase.sql`
- Si les données ne s'affichent pas, vérifiez `NODE_ENV` dans `.env.local`
- Si les API ne fonctionnent pas, vérifiez les variables d'environnement
- Testez la connexion avec `node scripts/test-postgres-connection.js`
- Consultez les logs Supabase dans le dashboard pour les erreurs
