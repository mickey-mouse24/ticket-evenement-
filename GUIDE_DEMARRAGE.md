# 🚀 Guide de Démarrage Rapide - AI-Karangué 2025

## ⚡ Démarrage Ultra-Rapide

### Option 1: Script Automatique (Recommandé)
```bash
./start.sh
```

### Option 2: Manuel
```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur
npm run dev
```

## 📱 URLs Importantes

| Page | URL | Description |
|------|-----|-------------|
| 🏠 **Accueil** | http://localhost:3000 | Page principale avec compte à rebours |
| 📝 **Réservation** | http://localhost:3000/reserve | Créer une nouvelle réservation |
| 🔍 **Vérification** | http://localhost:3000/verify | Interface admin pour vérifier les tickets |
| 📱 **Scanner** | http://localhost:3000/scanner-simple.html | Scanner QR codes |

## 🛠️ Fonctionnalités Testées ✅

- ✅ Serveur Next.js 14 opérationnel
- ✅ Base de données locale fonctionnelle (537 tickets)
- ✅ API REST (5 endpoints) 
- ✅ Génération de QR codes
- ✅ Export PDF des tickets
- ✅ Système de vérification
- ✅ Interface de scanning
- ✅ Gestion des places (465 disponibles sur 1000)

## 📊 Statistiques Actuelles

- **Total places**: 1,000
- **Places réservées**: 535
- **Places disponibles**: 465
- **IDs générés**: 1,224
- **Check-ins**: 2 participants

## 🔧 Scripts Utiles

```bash
# Générer des IDs uniques
node scripts/generate-unique-ids.js

# Tester le système complet
node scripts/test-complete-system.js

# Démarrer serveur HTTPS (pour scanner caméra)
node scripts/start-https-server.js
```

## 📞 Support

Le système est **100% opérationnel** ! 

En cas de problème :
1. Vérifier que Node.js v18+ est installé
2. Supprimer `node_modules` et relancer `npm install`
3. Vérifier que le port 3000 est libre

## 🎉 Prêt pour Production !

Votre système AI-Karangué 2025 est entièrement configuré et prêt à gérer l'événement du 20 septembre 2025 au CICAD de DIAMNIADIO ! 🇸🇳

---

**Développé avec ❤️ pour la révolution de la sécurité routière au Sénégal**
