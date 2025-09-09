'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [flipAnimation, setFlipAnimation] = useState({
    days: false,
    hours: false,
    minutes: false,
    seconds: false
  });

  const [placesRestantes, setPlacesRestantes] = useState(null);

  useEffect(() => {
    const targetDate = new Date('2025-09-20T09:00:00Z').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const newTimeLeft = { days, hours, minutes, seconds };
        
        // Déclencher l'animation flip si les valeurs changent
        setFlipAnimation(prev => ({
          days: timeLeft.days !== days,
          hours: timeLeft.hours !== hours,
          minutes: timeLeft.minutes !== minutes,
          seconds: timeLeft.seconds !== seconds
        }));

        setTimeLeft(newTimeLeft);
        
        // Réinitialiser les animations après un délai
        setTimeout(() => {
          setFlipAnimation({ days: false, hours: false, minutes: false, seconds: false });
        }, 600);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // Récupérer les places disponibles
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch('/api/reservations');
        const data = await response.json();
        if (data.success) {
          setPlacesRestantes(data.places);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des places:', error);
      }
    };

    fetchPlaces();
    
    // Actualiser les places toutes les 30 secondes
    const interval = setInterval(fetchPlaces, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
      {/* Éléments de fond décoratifs */}
      <div className="absolute inset-0">
        {/* Cercles et formes géométriques */}
        <div className="absolute top-20 right-20 w-96 h-96 border border-white/10 rounded-full"></div>
        <div className="absolute bottom-40 left-20 w-64 h-64 border border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-white/20 rounded-full"></div>
        
        {/* Éléments technologiques */}
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute top-2/3 right-1/4 w-6 h-6 bg-white/15 rounded-full"></div>
        
        {/* Lignes de connexion */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>


      

      {/* Contenu principal */}
      <main className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-8">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Titre principal */}
          <div className="mb-8 sm:mb-16">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32">
                <Image
                  src="/logo AI-Karangué.png"
                  alt="AI-Karangué Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 leading-tight px-2">
              <span className="block text-white mb-2 sm:mb-4">AI-KARANGUÉ</span>
              <span className="block text-lg sm:text-2xl md:text-4xl text-white/80 font-light">La Révolution de la Sécurité Routière Sénégalaise</span>
            </h1>
            
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl text-white font-semibold mb-4 sm:mb-6 px-2">
              Sen Karangué, Sunu Yitté
              </h2>
            
            </div>
          </div>

          {/* Compte à rebours */}
          <div className="mb-8 sm:mb-16">
            <h3 className="text-lg sm:text-2xl font-bold text-white mb-8 sm:mb-12 px-2">Le Lancement qui Changera l'Histoire</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-sm sm:max-w-3xl mx-auto px-2">
              {/* Jours */}
              <div className="text-center">
                <div className="countdown-box rounded-xl p-3 sm:p-6">
                  <div className={`text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 countdown-number ${flipAnimation.days ? 'countdown-flip' : ''}`}>
                    {formatTime(timeLeft.days).slice(-3)}
                  </div>
                  <div className="text-white/80 font-medium uppercase tracking-wide text-xs sm:text-sm">JOUR(S)</div>
                </div>
              </div>
              
              {/* Heures */}
              <div className="text-center">
                <div className="countdown-box rounded-xl p-3 sm:p-6">
                  <div className={`text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 countdown-number ${flipAnimation.hours ? 'countdown-flip' : ''}`}>
                  {formatTime(timeLeft.hours)}
                  </div>
                  <div className="text-white/80 font-medium uppercase tracking-wide text-xs sm:text-sm">HEURE(S)</div>
                </div>
              </div>
              
              {/* Minutes */}
              <div className="text-center">
                <div className="countdown-box rounded-xl p-3 sm:p-6">
                  <div className={`text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 countdown-number ${flipAnimation.minutes ? 'countdown-flip' : ''}`}>
                  {formatTime(timeLeft.minutes)}
                  </div>
                  <div className="text-white/80 font-medium uppercase tracking-wide text-xs sm:text-sm">MINUTE(S)</div>
                </div>
              </div>
              
              {/* Secondes */}
              <div className="text-center">
                <div className="countdown-box rounded-xl p-3 sm:p-6">
                  <div className={`text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 countdown-number ${flipAnimation.seconds ? 'countdown-flip' : ''}`}>
                  {formatTime(timeLeft.seconds)}
                  </div>
                  <div className="text-white/80 font-medium uppercase tracking-wide text-xs sm:text-sm">SECONDE(S)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations événement */}
          <div className="mb-8 sm:mb-16 px-2">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-6 sm:mb-8">
              <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                <span className="text-white font-semibold text-sm sm:text-base">20 septembre 2025</span>
              </div>
              
              <div className="hidden sm:block w-px h-6 bg-white/40"></div>
              
              <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                <span className="text-white font-semibold text-sm sm:text-base">CICAD - RUFISQUE</span>
              </div>
              
              <div className="hidden sm:block w-px h-6 bg-white/40"></div>
              
              <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                <span className="text-white font-semibold text-sm sm:text-base">10h00 - 14h00</span>
              </div>
            </div>

            {/* Affichage des places restantes */}
            {placesRestantes && (
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-red-300/30 rounded-2xl px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-white font-bold text-lg sm:text-xl">
                        {placesRestantes.available} places restantes
                      </div>
                      <div className="text-red-200 text-sm">
                        sur {placesRestantes.total} places disponibles
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

         {/* Boutons en haut */}
      <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          <Link href="/reserve" className="w-full sm:w-auto">
            <button className="group relative w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 transform overflow-hidden">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">RÉSERVEZ VOTRE PLACE</span>
                <span className="sm:hidden">RÉSERVER</span>
              </span>
            </button>
          </Link>
          
          <button className="group relative w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:border-white/50 text-white font-bold py-3 sm:py-4 px-4 sm:px-8 rounded-2xl transition-all duration-300 hover:bg-white/20 hover:scale-105 transform overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">TÉLÉCHARGER LE PROGRAMME</span>
              <span className="sm:hidden">TÉLÉCHARGER</span>
            </span>
          </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};