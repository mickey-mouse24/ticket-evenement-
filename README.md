# AIKarangue - Plateforme de Réservation d'Événements

Une application Next.js complète pour la gestion des réservations d'événements avec authentification, QR codes et tableaux de bord administrateur/staff.

## 🚀 Fonctionnalités

### Pages Publiques
- **Page d'accueil** - Présentation de l'événement avec compte à rebours
- **Programme** - Détails complets de l'événement avec intervenants
- **Réservation** - Formulaire de réservation avec génération de QR code

### Authentification
- **Connexion/Inscription** - Système d'authentification complet
- **Gestion de profil** - Modification des informations personnelles

### Tableaux de Bord
- **Admin Dashboard** - Gestion complète des utilisateurs et réservations
- **Staff Dashboard** - Scanner QR codes et gestion des entrées

## 🛠 Technologies Utilisées

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Supabase** - Base de données PostgreSQL cloud
- **JWT** - Authentification
- **QRCode** - Génération de QR codes
- **Lucide React** - Icônes modernes
- **Framer Motion** - Animations (prêt à utiliser)

## 📦 Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer Supabase**
   ```bash
   # Créer le fichier .env.local à la racine
   NEXT_PUBLIC_SUPABASE_URL=https://spjsuglnqjtdfwdzvkn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   JWT_SECRET=aikarangue-super-secret-key-2026
   
   # Exécuter le script SQL dans Supabase Dashboard
   # Copier le contenu de supabase-schema.sql dans l'éditeur SQL
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Accéder à l'application**
   - Application : http://localhost:3000
   - Supabase Dashboard : https://supabase.com/dashboard

## 👥 Comptes de Démonstration

L'application inclut des comptes de test :

- **Administrateur**
  - Email: admin@aikarangue.com
  - Mot de passe: admin123

- **Staff**
  - Email: staff@aikarangue.com
  - Mot de passe: staff123

- **Utilisateur**
  - Email: user@aikarangue.com
  - Mot de passe: user123

## 📁 Structure du Projet

```
aikarangue_Ticket/
├── app/                    # App Router Next.js
│   ├── api/               # Routes API
│   │   ├── auth/          # Authentification
│   │   ├── admin/         # API Admin
│   │   ├── staff/         # API Staff
│   │   └── reservations/  # Gestion réservations
│   ├── admin/             # Dashboard admin
│   ├── staff/             # Dashboard staff
│   ├── profile/           # Profil utilisateur
│   ├── program/           # Page programme
│   ├── reserve/           # Page réservation
│   ├── login/             # Connexion
│   ├── register/          # Inscription
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── components/            # Composants réutilisables
├── prisma/               # Configuration Prisma
└── src/lib/              # Utilitaires
```

## 🎨 Pages et Fonctionnalités

### 🏠 Page d'Accueil
- Design moderne avec gradient
- Compte à rebours jusqu'à l'événement
- Section des fonctionnalités
- Call-to-action pour réservation

### 📋 Page Programme
- Planning détaillé de la journée
- Profils des intervenants
- Informations pratiques
- Design responsive

### 🎫 Page Réservation
- Formulaire complet avec validation
- Génération automatique de QR code
- Page de confirmation
- Option d'impression

### 👤 Profil Utilisateur
- Modification des informations
- Historique des réservations
- Actions rapides
- Gestion des QR codes

### 🛡️ Dashboard Administrateur
- Vue d'ensemble avec statistiques
- Gestion des utilisateurs
- Gestion des réservations
- Modification des statuts

### 📱 Dashboard Staff
- Scanner de QR codes
- Check-in manuel
- Statistiques en temps réel
- Historique des entrées

## 🔧 Configuration

### Variables d'Environnement
Créer un fichier `.env` :
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre-secret-jwt-super-securise"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Base de Données Supabase
Le schéma PostgreSQL inclut :
- **users** - Utilisateurs avec rôles (ADMIN, STAFF, ATTENDEE)
- **reservations** - Réservations avec QR codes et check-in
- **Policies RLS** - Sécurité au niveau des lignes
- **Index optimisés** - Performance des requêtes

## 🚀 Déploiement

1. **Build de production**
   ```bash
   npm run build
   ```

2. **Variables d'environnement production**
   - Configurer les URLs Supabase de production
   - Définir `JWT_SECRET` sécurisé
   - Ajuster `NEXTAUTH_URL`

3. **Configuration Supabase**
   - Base de données déjà hébergée et scalable
   - Backups automatiques
   - SSL/TLS natif

## 📱 Responsive Design

L'application est entièrement responsive :
- Mobile-first approach
- Navigation adaptative
- Tableaux scrollables sur mobile
- Formulaires optimisés tactile

## 🔐 Sécurité

- Authentification JWT
- Validation côté serveur
- Protection des routes API
- Sanitisation des données
- Cookies sécurisés

## 🎯 Prochaines Étapes

- [ ] Notifications email
- [ ] Paiements en ligne
- [ ] Export des données
- [ ] Notifications push
- [ ] Scan QR en temps réel
- [ ] Analytics avancées

## 📄 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

---

Développé avec ❤️ pour AIKarangue 2026
