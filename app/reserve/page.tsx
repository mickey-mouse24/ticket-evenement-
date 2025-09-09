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
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Récupérer les places disponibles dynamiquement
  React.useEffect(() => {
    const fetchAvailablePlaces = async () => {
      try {
        setIsLoadingPlaces(true);
        const response = await fetch('/api/reservations');
        const data = await response.json();
        
        if (data.success && data.places) {
          setPlacesRestantes(data.places);
        } else {
          // Fallback en cas d'erreur
          setPlacesRestantes({ total: 500, reserved: 0, available: 500 });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des places:', error);
        // Fallback en cas d'erreur
        setPlacesRestantes({ total: 500, reserved: 0, available: 500 });
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    fetchAvailablePlaces();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reservations', {
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
            <p className="text-sm text-gray-600 mb-2">#jefaismapart</p>
            <div className="text-xs text-gray-500 mb-4">
              <div>20 septembre 2025</div>
              <div>CICAD - DIAMNIADIO | 09h30-12h30</div>
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
    <div className="h-screen bg-white relative overflow-hidden">
      {/* Background avec pattern et dégradé - identique à la page d'accueil */}
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src="/pattern.jpeg"
            alt="Pattern"
            fill
            className="object-cover opacity-10"
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-blue-50/60 to-indigo-50/80"></div>
        </div>
        
        {/* Éléments décoratifs subtils - cachés sur mobile */}
        <div className="hidden md:block absolute top-20 right-20 w-96 h-96 border border-gray-100 rounded-full opacity-50"></div>
        <div className="hidden md:block absolute bottom-40 left-20 w-64 h-64 border border-gray-100 rounded-full opacity-30"></div>
        <div className="hidden md:block absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-teal-100/20 to-blue-100/20 rounded-full opacity-60"></div>
        
        {/* Éléments décoratifs mobiles plus petits */}
        <div className="md:hidden absolute top-16 right-8 w-24 h-24 border border-gray-100 rounded-full opacity-30"></div>
        <div className="md:hidden absolute bottom-20 left-6 w-16 h-16 bg-gradient-to-r from-teal-100/20 to-blue-100/20 rounded-full opacity-40"></div>
      </div>

      {/* Navigation avec logo - identique à la page d'accueil */}
      <nav className="relative z-20 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="/logo AI-Karangué.png"
                alt="AI-Karangué Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
          
          {/* Status badge places - responsive */}
          {placesRestantes && (
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 text-xs sm:text-sm font-medium">
                <span className="hidden sm:inline">{placesRestantes.available} places disponibles</span>
                <span className="sm:hidden">{placesRestantes.available} places</span>
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Contenu principal - Layout optimisé mobile */}
      <main className="relative z-10 px-4 sm:px-6 flex flex-col h-full">
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full py-4">
          
          {/* Section héro compacte mobile */}
          <div className="text-center mb-6 lg:mb-8">
            <div className="space-y-3 sm:space-y-4 mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight px-2">
                <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Réserver Ma Place
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light max-w-2xl mx-auto px-2">
                Rejoignez la révolution de la sécurité routière sénégalaise
              </p>
            </div>
          </div>

          {/* Layout mobile-first pour le formulaire */}
          <div className="max-w-lg mx-auto w-full">
            
            {/* Card du formulaire */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 sm:p-8 shadow-sm">
              
              {/* Affichage des places restantes */}
              {isLoadingPlaces ? (
                <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div>
                      <div className="text-gray-700 font-semibold text-sm">
                        Chargement des places disponibles...
                      </div>
                    </div>
                  </div>
                </div>
              ) : placesRestantes && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-green-800 font-semibold text-base">
                        {placesRestantes.available} places disponibles
                      </div>
                      <div className="text-green-600 text-sm">
                        Ne tardez pas à réserver votre place !
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message d'erreur */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-red-700 text-sm font-medium">
                      {error}
                    </div>
                  </div>
                </div>
              )}

              {/* Formulaire responsive */}
              <form onSubmit={submit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Prénom"
                      value={form.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 sm:py-3.5 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
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
                      className="w-full px-4 py-3 sm:py-3.5 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <select className="px-3 py-3 sm:py-3.5 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-gray-900">
                    <option>+221</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Téléphone"
                    value={form.phone}
                    onChange={handleInputChange}
                    required
                    className="flex-1 px-4 py-3 sm:py-3.5 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
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
                    className="w-full px-4 py-3 sm:py-3.5 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="structure"
                    placeholder="Structure / Entreprise"
                    value={form.structure}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 sm:py-3.5 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <select
                    name="fonction"
                    value={form.fonction}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 sm:py-3.5 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-gray-700"
                  >
                    <option value="">Choisir votre fonction</option>
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

                {/* Bouton de soumission */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3.5 sm:py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-teal-500/25 active:scale-95 sm:hover:scale-105 transform disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-3">
                      {isLoading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm sm:text-base">Validation en cours...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm sm:text-base">Réserver ma place</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>

              {/* Informations événement en bas */}
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 font-medium">20 septembre 2025 • CICAD - DIAMNIADIO • 09h30-12h30</p>
                  <p className="text-xs text-gray-500">Sen Karangué, Sunu Yitté</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}