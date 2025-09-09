'use client';

import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ReservePage() {
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    email: '', 
    structure: '', 
    fonction: '' 
  });
  const [qr, setQr] = useState<string | null>(null);
  const [reservationData, setReservationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placesRestantes, setPlacesRestantes] = useState<any>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Récupérer les places disponibles
  React.useEffect(() => {
    // Utiliser des données par défaut pour éviter les problèmes d'API
    setPlacesRestantes({ total: 1000, reserved: 521, available: 479 });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          company: form.structure,
          fonction: form.fonction
        }),
      });

      const data = await response.json();

      if (data.success && data.reservation) {
        // Mettre à jour les places restantes si disponible
        if (data.placesRestantes !== undefined) {
          setPlacesRestantes(prev => prev ? { ...prev, available: data.placesRestantes } : null);
        }
        
        setReservationData({
          id: data.reservation.id,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          structure: form.structure,
          fonction: form.fonction,
          event: 'AIKarangue 2025 - Innovation Summit',
          date: '20 Septembre 2025',
          location: 'CICAD, Route De Diamniadio, Dakar, Sénégal',
          qrcode: data.reservation.qrcode
        });
        setQr(data.qr);
      } else {
        throw new Error(data.message || 'Erreur lors de la réservation');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la réservation');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!ticketRef.current || !reservationData) return;
    
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Capturer le ticket avec une meilleure qualité
      const canvas = await html2canvas(ticketRef.current, {
        background: '#ffffff',
        scale: 3, // Haute résolution
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Format ticket personnalisé (100mm x 180mm - format étendu pour meilleur affichage du logo)
      const ticketWidth = 100;  // mm
      const ticketHeight = 180; // mm (augmenté pour plus d'espace)
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [ticketWidth, ticketHeight]
      });

      // Calculer les dimensions pour bien remplir le format ticket
      const canvasAspectRatio = canvas.width / canvas.height;
      const ticketAspectRatio = ticketWidth / ticketHeight;
      
      let imgWidth, imgHeight, xOffset, yOffset;
      
      if (canvasAspectRatio > ticketAspectRatio) {
        // Image plus large que le ticket - ajuster par la hauteur
        imgHeight = ticketHeight - 10; // 5mm de marge de chaque côté
        imgWidth = imgHeight * canvasAspectRatio;
        xOffset = (ticketWidth - imgWidth) / 2;
        yOffset = 5;
      } else {
        // Image plus haute que le ticket - ajuster par la largeur
        imgWidth = ticketWidth - 10; // 5mm de marge de chaque côté
        imgHeight = imgWidth / canvasAspectRatio;
        xOffset = 5;
        yOffset = (ticketHeight - imgHeight) / 2;
      }
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      pdf.save(`ticket-aikarangue-${reservationData.id}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  if (reservationData && qr) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#24315c' }}>
        <div ref={ticketRef} className="bg-white rounded-lg p-8 w-80 text-center shadow-2xl" style={{minHeight: '540px', maxWidth: '320px'}}>
          <div className="mb-6">
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
                <Image
                  src="/logo AI-Karangué.png"
                  alt="AI-Karangué Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#008081' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#24315c' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#008081' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#24315c' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#008081' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#24315c' }}></div>
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">AI-KARANGUÉ</h1>
            <p className="text-sm text-gray-600 mb-2">#jefaitmapart</p>
            <div className="text-xs text-gray-500 mb-4">
              <div>20 septembre 2025</div>
              <div>CICAD - RUFISQUE | 10h00-14h00</div>
            </div>
            </div>
            
          <div className="space-y-3 mb-6 text-left">
            <div>
              <p className="text-xs text-gray-500">Participant</p>
              <p className="font-semibold text-sm">{reservationData.firstName} {reservationData.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Structure</p>
              <p className="font-semibold text-sm">{reservationData.structure}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fonction</p>
              <p className="font-semibold text-sm">{reservationData.fonction}</p>
            </div>
            </div>
            
          <div className="border-t pt-6 mt-6">
            <div className="w-32 h-32 mx-auto mb-4">
              <img src={qr} alt="QR Code" className="w-full h-full" />
            </div>
            <p className="text-xs text-gray-500">ID: {reservationData.id}</p>
            <p className="text-xs text-gray-400 mt-2">Présentez ce ticket à l'entrée</p>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={downloadPDF}
            className="text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 shadow-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#008081' }}
          >
            <span>Télécharger le Ticket PDF</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundColor: '#24315c' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full opacity-30" style={{ backgroundColor: '#008081' }}></div>
        <div className="absolute top-40 right-32 w-1 h-1 rounded-full opacity-40" style={{ backgroundColor: '#24315c' }}></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 rounded-full opacity-35" style={{ backgroundColor: '#008081' }}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 rounded-full opacity-25" style={{ backgroundColor: '#24315c' }}></div>
        
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-gray-800 text-8xl font-bold opacity-5 select-none">
        La Révolution de la Sécurité Routière Sénégalaise
        </div>
      </div>

      {/* AIKarangue Logo */}
      <div className="absolute top-8 left-8">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#008081' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#24315c' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#008081' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#24315c' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#008081' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#24315c' }}></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo AI-Karangué.png"
                  alt="AI-Karangué Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">AI-KARANGUÉ</h1>
                <p className="text-gray-300 text-sm">L'innovation par et pour l'Afrique</p>
              </div>
            </div>
          </div>
        </Link>
      </div>


      {/* Reservation Form Modal */}
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Réserver Ma Place Pour AIKarangue 
          </h2>
          <button className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Affichage des places restantes */}
        {placesRestantes && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-green-800 font-semibold text-sm">
                  {placesRestantes.available} places encore disponibles
                </div>
                <div className="text-green-600 text-xs">
                  Ne tardez pas à réserver votre place !
                </div>
              </div>
            </div>
          </div>
        )}

          {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

        <form onSubmit={submit} className="space-y-4">
            <div>
              <input
                type="text"
              name="firstName"
              placeholder="Prénom"
              value={form.firstName}
              onChange={handleInputChange}
                required
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:bg-white transition-all"
              style={{ '--tw-ring-color': '#008081' } as React.CSSProperties}
              />
            </div>

            <div>
              <input
              type="text"
              name="lastName"
              placeholder="Nom"
              value={form.lastName}
              onChange={handleInputChange}
                required
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:bg-white transition-all"
              style={{ '--tw-ring-color': '#008081' } as React.CSSProperties}
              />
            </div>

          <div className="flex space-x-2">
            <select className="px-3 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white">
              <option>+221</option>
            </select>
              <input
                type="tel"
              name="phone"
              placeholder="Téléphone"
              value={form.phone}
              onChange={handleInputChange}
                required
              className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:bg-white transition-all"
              style={{ '--tw-ring-color': '#008081' } as React.CSSProperties}
              />
            </div>

          <div className="relative">
            <input
              type="text"
              name="structure"
              placeholder="Structure"
              value={form.structure}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all pr-32"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
              Veuillez renseigner ce champ.
            </span>
                </div>

          <div>
            <select
              name="fonction"
              value={form.fonction}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-500"
            >
              <option value="">-- Merci de choisir votre fonction --</option>
              <option value="Directeur/CEO">Directeur/CEO</option>
              <option value="Manager">Manager</option>
              <option value="Développeur">Développeur</option>
              <option value="Designer">Designer</option>
              <option value="Consultant">Consultant</option>
              <option value="Étudiant">Étudiant</option>
              <option value="Entrepreneur">Entrepreneur</option>
              <option value="Autre">Autre</option>
            </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
            className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: '#008081' }}
          >
            {isLoading ? 'VALIDATION EN COURS...' : 'VALIDER'}
            </button>
          </form>
      </div>
    </div>
  );
}