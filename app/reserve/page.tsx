'use client';
import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export default function ReservePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [qr, setQr] = useState<string | null>(null);
  const [reservationData, setReservationData] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    event: string;
    date: string;
    location: string;
    qrcode: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Envoi de la réservation:', form);
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      console.log('Réponse de l\'API:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la réservation');
      }
      
      const data = await res.json();
      console.log('Données reçues:', data);
      
      // Utiliser le QR code généré par l'API et créer les données de réservation
      const ticketInfo = {
        id: data.reservation.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        event: 'AIKarangue 2025',
        date: '20 Septembre 2025',
        location: 'Rufisque, Sénégal',
        qrcode: data.reservation.qrcode
      };
      
      setQr(data.qr); // Utiliser le QR code généré par l'API
      setReservationData(ticketInfo);
    } catch (err: any) {
      console.error('Erreur complète:', err);
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      
      // Pour les tests, créer une réservation factice si l'API échoue
      if (process.env.NODE_ENV === 'development') {
        console.log('Mode développement: création d\'une réservation factice');
        const mockTicketInfo = {
          id: `MOCK-${Date.now()}`,
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          event: 'AIKarangue 2025',
          date: '20 Septembre 2025',
          location: 'Rufisque, Sénégal',
          qrcode: `AIK2025-MOCK-${Date.now()}`
        };
        
        try {
          const mockQrCodeData = await QRCode.toDataURL(JSON.stringify(mockTicketInfo), {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          setQr(mockQrCodeData);
          setReservationData(mockTicketInfo);
          setError(null); // Effacer l'erreur puisqu'on utilise les données factices
        } catch (qrError) {
          console.error('Erreur génération QR factice:', qrError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  const downloadPDF = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        useCORS: true,
        allowTaint: true,
        width: ticketRef.current.offsetWidth * 2,
        height: ticketRef.current.offsetHeight * 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`ticket-aikarangue-${reservationData?.name?.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    }
  };

  if (qr && reservationData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservation confirmée !</h1>
            <p className="text-gray-600 mb-6">
              Votre place pour AIKarangue 2025 est confirmée. Téléchargez votre ticket ci-dessous.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                onClick={downloadPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Télécharger PDF</span>
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Imprimer</span>
              </button>
              <a href="/" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2">
                <span>Retour à l'accueil</span>
              </a>
            </div>
          </div>

          {/* Ticket Design */}
          <div ref={ticketRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-dashed border-gray-300 max-w-3xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-4xl font-bold mb-2">AIKarangue</h2>
                  <p className="text-xl opacity-90">L'Avenir de l'Intelligence Artificielle</p>
                  <p className="text-lg opacity-80 mt-2">Conférence Internationale 2025</p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm opacity-80">ID Ticket</p>
                    <p className="font-mono font-bold text-lg">#{reservationData.id}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Participant Info */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Informations du Participant</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Nom complet</p>
                      <p className="text-lg font-semibold text-gray-900">{reservationData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email</p>
                      <p className="text-lg text-gray-900">{reservationData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Téléphone</p>
                      <p className="text-lg text-gray-900">{reservationData.phone}</p>
                    </div>
                    {reservationData.company && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Organisation</p>
                        <p className="text-lg text-gray-900">{reservationData.company}</p>
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="mt-8 bg-blue-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-blue-900 mb-4">Détails de l'Événement</h4>
                    <div className="space-y-3 text-blue-800">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>20 Septembre 2025, 09h00 - 17h30</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span>Rufisque, Sénégal</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span>Entrée Gratuite</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">QR Code d'Accès</h3>
                  <div className="bg-white border-4 border-gray-200 rounded-2xl p-6 inline-block">
                    <img src={qr} alt="QR Code de réservation" className="w-48 h-48 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600 mt-4 max-w-xs mx-auto">
                    Présentez ce QR Code à l'entrée le jour de l'événement. 
                    Il contient toutes vos informations de réservation.
                  </p>
                  
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Instructions importantes</h4>
                    <ul className="text-sm text-yellow-700 text-left space-y-1">
                <li>• Arrivée recommandée : 08h30</li>
                      <li>• Apportez une pièce d'identité</li>
                      <li>• Conservez ce ticket jusqu'à la fin</li>
                      <li>• Email de confirmation envoyé</li>
              </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-100 px-8 py-4 border-t border-dashed border-gray-300">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <p>© 2025 AIKarangue - Tous droits réservés</p>
                <p>Ticket généré le {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
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
            Complétez le formulaire ci-dessous pour réserver votre place à AIKarangue 2025.
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
                  20 Septembre 2025, 09h00 - 17h30
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Rufisque, Sénégal
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
