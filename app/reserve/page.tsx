'use client';
import { useState } from 'react';

export default function ReservePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [qr, setQr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la réservation');
      }
      
      const data = await res.json();
      setQr(data.qr);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }

  if (qr) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-6">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Réservation confirmée !</h1>
            <p className="text-gray-600 mb-8">
              Votre place pour AIKarangue 2026 est confirmée. Conservez précieusement votre QR Code.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Votre QR Code d'accès</h3>
              <img src={qr} alt="QR Code de réservation" className="mx-auto mb-4 border rounded-lg" />
              <p className="text-sm text-gray-600">
                Présentez ce QR Code à l'entrée le jour de l'événement
              </p>
            </div>
            
            <div className="text-left bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Informations importantes</h3>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• Date : 15 Janvier 2026 à 09h00</li>
                <li>• Lieu : Centre de Conférences Paris</li>
                <li>• Arrivée recommandée : 08h30</li>
                <li>• Un email de confirmation vous a été envoyé</li>
              </ul>
            </div>
            
            <button 
              onClick={() => window.print()} 
              className="btn-secondary mr-4"
            >
              Imprimer
            </button>
            <a href="/" className="btn-primary">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Réserver ma place</h1>
          <p className="text-gray-600 mb-8">
            Complétez le formulaire ci-dessous pour réserver votre place à AIKarangue 2026.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={submit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Votre nom et prénom"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="votre.email@exemple.com"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                required
                className="input-field"
                placeholder="+33 1 23 45 67 89"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entreprise / Organisation
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Nom de votre entreprise (optionnel)"
                value={form.company}
                onChange={(e) => setForm({...form, company: e.target.value})}
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Détails de l'événement</h3>
              <div className="text-blue-800 space-y-2 text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  15 Janvier 2026, 09h00 - 17h30
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Centre de Conférences Paris
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Gratuit - Places limitées
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? 'Réservation en cours...' : 'Confirmer ma réservation'}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-6 text-center">
            En soumettant ce formulaire, vous acceptez de recevoir des communications 
            relatives à l'événement AIKarangue.
          </p>
        </div>
      </div>
    </div>
  );
}
