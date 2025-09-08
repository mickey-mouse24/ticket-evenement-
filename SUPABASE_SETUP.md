# 🚀 Configuration Supabase pour AIKarangue

## Étapes Rapides

### 1. Configuration des Variables d'Environnement

Créer un fichier `.env.local` à la racine du projet :

```bash
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://spjsuglnqjtdfwdzvkn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwanN1Z2xucWp0ZGZ3ZHp2a24iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDk3ODc5MSwiZXhwIjoyMDUwNTU0NzkxfQ.wLUOLAUPNsI_BI2_fCZz_QMVV3s2rVx4Yzz_V4BnhGw

# Secret JWT
JWT_SECRET=aikarangue-super-secret-key-2026

# URL de l'application
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Initialisation de la Base de Données

1. **Aller sur Supabase Dashboard** : https://supabase.com/dashboard
2. **Ouvrir l'éditeur SQL** dans votre projet
3. **Copier-coller le contenu** du fichier `supabase-schema.sql`
4. **Exécuter le script** pour créer les tables

### 3. Vérification

Les tables suivantes doivent être créées :
- ✅ `users` - Utilisateurs avec rôles
- ✅ `reservations` - Réservations avec QR codes
- ✅ Utilisateurs de démonstration insérés
- ✅ Policies RLS configurées

### 4. Test des Comptes Démo

Une fois les tables créées, vous pouvez vous connecter avec :

- **Admin** : admin@aikarangue.com / admin123
- **Staff** : staff@aikarangue.com / staff123  
- **User** : user@aikarangue.com / user123

## 🔧 Fonctionnalités Supabase Utilisées

### ✅ **Authentification**
- Comptes démo avec JWT
- Gestion des rôles (Admin/Staff/Attendee)
- Sessions sécurisées

### ✅ **Base de Données**
- PostgreSQL hébergé
- Relations entre tables
- Index pour performance

### ✅ **Sécurité**
- Row Level Security (RLS)
- Policies par rôle
- Validation des données

### ✅ **API**
- Client TypeScript
- Requêtes optimisées
- Gestion d'erreurs

## 🚀 Avantages de Supabase

- **🌐 Cloud natif** - Pas de configuration locale
- **⚡ Performance** - PostgreSQL optimisé
- **🔒 Sécurité** - RLS et authentification intégrée
- **📈 Scalabilité** - Auto-scaling automatique
- **🔧 Dashboard** - Interface d'administration
- **💾 Backups** - Sauvegardes automatiques

## 📊 Monitoring

Dans le dashboard Supabase, vous pouvez :
- Voir les tables et données en temps réel
- Monitorer les performances
- Gérer les utilisateurs
- Consulter les logs
- Configurer les alertes

## 🔗 Liens Utiles

- **Projet Supabase** : https://spjsuglnqjtdfwdzvkn.supabase.co
- **Dashboard** : https://supabase.com/dashboard
- **Documentation** : https://supabase.com/docs

---

✨ **L'application est maintenant prête avec une base de données cloud professionnelle !**
