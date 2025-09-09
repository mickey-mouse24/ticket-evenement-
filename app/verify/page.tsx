'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function VerifyPage() {
  const [qrInput, setQrInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Récupérer les statistiques au chargement
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/verify-ticket');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchStats();
    // Actualiser les stats toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const verifyTicket = async (action = 'verify') => {
    if (!qrInput.trim()) {
      setResult({
        success: false,
        message: 'Veuillez saisir un code QR'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/verify-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrcode: qrInput.trim(),
          action
        }),
      });

      const data = await response.json();
      setResult(data);

      // Actualiser les stats après une action
      if (action === 'checkin' && data.success) {
        const statsResponse = await fetch('/api/verify-ticket');
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur de connexion'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = () => verifyTicket('checkin');
  const handleVerify = () => verifyTicket('verify');

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-blue-700 to-blue-900 text-white">
      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-white/20">
                <div className="text-white font-bold text-sm sm:text-lg">AI-KARANGUÉ</div>
                <div className="text-xs text-white/80 hidden sm:block">Vérification Tickets</div>
              </div>
            </div>
          </Link>

          {/* Statistiques */}
          {stats && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-white font-bold text-sm">Statistiques</div>
              <div className="text-xs text-white/80">
                <div>Total: {stats.total}</div>
                <div>Check-in: {stats.checked_in}</div>
                <div>En attente: {stats.pending}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative z-10 px-4 sm:px-6 pt-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Titre */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Vérification des Tickets
            </h1>
            <p className="text-white/80">
              Scannez ou saisissez le code QR pour vérifier l'authenticité des tickets
            </p>
          </div>

          {/* Formulaire de vérification */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">
                Code QR du Ticket
              </label>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Ex: AIK2025-ABC123XYZ"
                className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleVerify}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{isLoading ? 'Vérification...' : 'Vérifier Ticket'}</span>
              </button>
              
              <button
                onClick={handleCheckIn}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>{isLoading ? 'Check-in...' : 'Check-in Participant'}</span>
              </button>
            </div>
          </div>

          {/* Résultat de la vérification */}
          {result && (
            <div className={`rounded-2xl p-6 border ${
              result.success 
                ? 'bg-green-500/20 border-green-400/30 text-green-100' 
                : 'bg-red-500/20 border-red-400/30 text-red-100'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                {result.success ? (
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <h3 className="text-xl font-bold">
                  {result.success ? 'Ticket Valide' : 'Ticket Invalide'}
                </h3>
              </div>
              
              <p className="text-lg mb-4">{result.message}</p>
              
              {result.ticket && (
                <div className="bg-white/10 rounded-xl p-4 space-y-2">
                  <h4 className="font-semibold text-white">Informations du Ticket:</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Participant:</strong> {result.ticket.name}</div>
                    <div><strong>Email:</strong> {result.ticket.email}</div>
                    <div><strong>Téléphone:</strong> {result.ticket.phone}</div>
                    <div><strong>Structure:</strong> {result.ticket.company}</div>
                    <div><strong>Fonction:</strong> {result.ticket.fonction}</div>
                    <div><strong>Statut:</strong> {result.ticket.checked_in ? 'Déjà arrivé' : 'En attente'}</div>
                    {result.ticket.checked_in_at && (
                      <div><strong>Arrivé le:</strong> {new Date(result.ticket.checked_in_at).toLocaleString('fr-FR')}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-12 bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-4">Instructions d'utilisation</h3>
            <div className="space-y-3 text-white/80">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">1</div>
                <p><strong>Vérifier Ticket:</strong> Contrôle l'authenticité sans marquer comme utilisé</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">2</div>
                <p><strong>Check-in Participant:</strong> Marque le participant comme arrivé (action définitive)</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">3</div>
                <p>Un ticket déjà utilisé ne peut plus être utilisé une seconde fois</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
