#!/usr/bin/env node

/**
 * Serveur HTTPS local pour tester le scanner QR
 * La caméra nécessite HTTPS pour fonctionner
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createSelfSignedCert() {
  const certPath = path.join(__dirname, '..', 'ssl');
  const keyFile = path.join(certPath, 'key.pem');
  const certFile = path.join(certPath, 'cert.pem');
  
  // Créer le dossier SSL s'il n'existe pas
  if (!fs.existsSync(certPath)) {
    fs.mkdirSync(certPath, { recursive: true });
  }
  
  // Vérifier si les certificats existent déjà
  if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
    log('green', '✅ Certificats SSL existants trouvés');
    return { keyFile, certFile };
  }
  
  log('yellow', '🔐 Génération des certificats SSL auto-signés...');
  
  try {
    // Générer la clé privée
    execSync(`openssl genrsa -out "${keyFile}" 2048`, { stdio: 'pipe' });
    
    // Générer le certificat
    execSync(`openssl req -new -x509 -key "${keyFile}" -out "${certFile}" -days 365 -subj "/C=SN/ST=Dakar/L=Dakar/O=AI-Karangue/CN=localhost"`, { stdio: 'pipe' });
    
    log('green', '✅ Certificats SSL générés');
    return { keyFile, certFile };
    
  } catch (error) {
    log('red', '❌ Erreur génération certificats SSL');
    log('red', 'Vous pouvez installer OpenSSL ou utiliser le mode HTTP simple');
    return null;
  }
}

function getMimeType(ext) {
  const types = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };
  return types[ext] || 'text/plain';
}

function startHTTPSServer(keyFile, certFile) {
  const options = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile)
  };
  
  const server = https.createServer(options, (req, res) => {
    let filePath = path.join(__dirname, '..', 'public', req.url === '/' ? 'scanner-simple.html' : req.url);
    
    // Servir les fichiers du projet Next.js si nécessaire
    if (!fs.existsSync(filePath)) {
      if (req.url.startsWith('/api/')) {
        // Rediriger les API vers le serveur Next.js
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <script>
            // Redirection vers le serveur Next.js pour les API
            fetch('http://localhost:3000${req.url}', {
              method: '${req.method}',
              headers: { 'Content-Type': 'application/json' },
              body: ${req.method === 'POST' ? 'JSON.stringify(await req.json())' : 'null'}
            }).then(r => r.json()).then(data => {
              document.body.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            });
          </script>
        `);
        return;
      }
      
      // Essayer dans le dossier racine
      filePath = path.join(__dirname, '..', req.url.substring(1));
    }
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const mimeType = getMimeType(ext);
      
      res.writeHead(200, { 'Content-Type': mimeType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>404 - Fichier non trouvé</h1>
        <p>Fichier demandé: ${req.url}</p>
        <p>Chemin testé: ${filePath}</p>
        <a href="/scanner-simple.html">Scanner Simple</a> | 
        <a href="/scanner-ids.html">Scanner Principal</a>
      `);
    }
  });
  
  const port = 8443;
  server.listen(port, () => {
    log('green', '🚀 Serveur HTTPS démarré !');
    log('cyan', `📱 Scanner Simple: https://localhost:${port}/scanner-simple.html`);
    log('cyan', `🎫 Scanner Principal: https://localhost:${port}/scanner-ids.html`);
    log('yellow', '⚠️  Acceptez le certificat auto-signé dans votre navigateur');
    log('blue', '💡 Astuce: Marquez cette exception comme permanente pour éviter les avertissements');
  });
  
  return server;
}

function startSimpleHTTPServer() {
  log('yellow', '🌐 Démarrage serveur HTTP simple (sans caméra)...');
  
  const http = require('http');
  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '..', 'public', req.url === '/' ? 'scanner-simple.html' : req.url);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const mimeType = getMimeType(ext);
      
      res.writeHead(200, { 'Content-Type': mimeType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>404 - Fichier non trouvé</h1>
        <p>Utilisez: http://localhost:8080/scanner-simple.html</p>
        <p>Note: La caméra ne fonctionnera pas en HTTP</p>
      `);
    }
  });
  
  const port = 8080;
  server.listen(port, () => {
    log('blue', `🌐 Serveur HTTP: http://localhost:${port}/scanner-simple.html`);
    log('red', '⚠️  La caméra ne fonctionnera pas en HTTP - utilisez seulement la saisie manuelle');
  });
  
  return server;
}

function main() {
  log('cyan', '🎫 SERVEUR HTTPS POUR SCANNER QR');
  log('cyan', '='.repeat(40));
  
  const certs = createSelfSignedCert();
  
  if (certs) {
    startHTTPSServer(certs.keyFile, certs.certFile);
  } else {
    log('yellow', '📝 Démarrage en mode HTTP simple...');
    startSimpleHTTPServer();
  }
  
  log('');
  log('blue', '📋 Instructions:');
  log('white', '1. Ouvrez l\'URL HTTPS dans votre navigateur');
  log('white', '2. Acceptez le certificat auto-signé');
  log('white', '3. Autorisez l\'accès à la caméra');
  log('white', '4. Testez le scanner QR');
  log('');
  log('green', '✨ Serveur prêt ! Appuyez sur Ctrl+C pour arrêter');
}

if (require.main === module) {
  main();
}
