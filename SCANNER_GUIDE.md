# 📱 Guide Scanner QR AI-Karangué

## 🚨 **PROBLÈME IDENTIFIÉ**

Le scanner QR avec caméra ne fonctionne pas car **les navigateurs modernes exigent HTTPS pour accéder à la caméra**.

## ✅ **SOLUTIONS DISPONIBLES**

### **Solution 1: Scanner Simple (Recommandé)**
```
http://localhost:3000/scanner-simple.html
```
- ✅ Interface plus compatible
- ✅ Saisie manuelle fonctionnelle
- ❌ Caméra ne marche qu'en HTTPS

### **Solution 2: Serveur HTTPS Local**
```bash
node scripts/start-https-server.js
```
Puis ouvrir: `https://localhost:8443/scanner-simple.html`
- ✅ Caméra fonctionnelle
- ⚠️ Certificat auto-signé à accepter

### **Solution 3: Saisie Manuelle Uniquement**
- Tapez directement l'ID du ticket: `AIK-XXXXXX`
- Fonctionne sur toutes les interfaces

## 🧪 **TESTS DISPONIBLES**

### **Test Automatique:**
```bash
node scripts/test-scanner.js
```

### **IDs de Test:**
- `AIK-TEST99` (ID de démonstration)
- `AIK-KMZT19` (ID généré récemment)

## 📱 **UTILISATION MOBILE**

### **Pour Scanner avec Téléphone:**
1. Démarrez le serveur HTTPS: `node scripts/start-https-server.js`
2. Ouvrez `https://localhost:8443/scanner-simple.html`
3. Acceptez le certificat auto-signé
4. Autorisez l'accès à la caméra
5. Scannez le QR code du ticket

### **Alternative Mobile:**
1. Utilisez l'app caméra native du téléphone
2. Scannez le QR code → copie l'ID (ex: `AIK-ABC123`)
3. Ouvrez `http://localhost:3000/scanner-simple.html`
4. Collez l'ID dans le champ de saisie
5. Cliquez "Vérifier"

## 🔧 **DÉPANNAGE**

### **Erreur "Permission refusée":**
- Autorisez l'accès caméra dans le navigateur
- Vérifiez que vous êtes en HTTPS

### **Erreur "Caméra non trouvée":**
- Vérifiez que votre appareil a une caméra
- Essayez un autre navigateur (Chrome recommandé)

### **Scanner ne détecte rien:**
- Améliorez l'éclairage
- Tenez le QR code stable
- Assurez-vous que le QR code est net

### **API ne répond pas:**
- Vérifiez que Next.js tourne: `npm run dev`
- Testez l'API: `http://localhost:3000/api/verify-unique-id`

## 🎯 **WORKFLOW RECOMMANDÉ**

### **Pour Contrôleurs d'Accès:**
1. **Démarrage:**
   ```bash
   npm run dev  # Terminal 1
   node scripts/start-https-server.js  # Terminal 2
   ```

2. **Utilisation:**
   - Ouvrir `https://localhost:8443/scanner-simple.html`
   - Accepter le certificat une seule fois
   - Scanner ou taper les IDs des tickets

3. **Workflow:**
   ```
   Scanner QR → ID détecté → Vérification auto → Check-in
   ```

### **Saisie Manuelle (Fallback):**
1. Participant montre son QR code
2. Vous lisez l'ID visuellement: `AIK-ABC123`
3. Tapez dans le champ de saisie
4. Cliquez "Vérifier" puis "Check-in"

## 📊 **STATISTIQUES**

Les deux interfaces affichent:
- ✅ Nombre total de tickets
- ✅ Check-ins effectués
- ✅ Tickets en attente
- ✅ Taux de participation

## 🌟 **RÉSUMÉ**

**Le système fonctionne parfaitement !** 

Le seul "problème" est que la caméra nécessite HTTPS. Utilisez:
- **Scanner Simple** pour la saisie manuelle
- **Serveur HTTPS** pour la caméra
- **Les deux sont fonctionnels** pour la vérification des tickets

**🎉 Votre système de tickets AI-Karangué est opérationnel ! 🎉**
