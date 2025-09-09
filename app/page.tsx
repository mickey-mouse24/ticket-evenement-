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
    <div className="h-screen bg-white relative overflow-hidden">
      {/* Background avec pattern et dégradé */}
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

      {/* Navigation avec logo - optimisée mobile */}
      <nav className="relative z-20 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            <Image
              src="/logo AI-Karangué.png"
              alt="AI-Karangué Logo"
              fill
              className="object-contain"
            />
          </div>
          
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
        <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full py-4">
          
          {/* Section héro compacte mobile */}
          <div className="text-center mb-6 lg:mb-8">
            <div className="space-y-3 sm:space-y-4 mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight px-2">
                <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI-KARANGUÉ
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 font-light max-w-3xl mx-auto px-2">
                La Révolution de la Sécurité Routière Sénégalaise
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 font-medium px-2">
                Sen Karangué, Sunu Yitté
              </p>
            </div>
          </div>

          {/* Layout mobile-first */}
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
            
            {/* Section compteur - mobile first */}
            <div className="space-y-4 lg:space-y-6 order-1">
              <div className="text-center lg:text-left">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 px-2">
                  Le Lancement qui Changera l'Histoire
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 px-2">
                  <span className="block sm:hidden">20 sept 2025</span>
                  <span className="hidden sm:block lg:hidden">20 septembre 2025 • CICAD</span>
                  <span className="hidden lg:block">20 septembre 2025 • CICAD - DIAMNIADIO • 09h30-12h30</span>
                </p>
              </div>
              
              {/* Compteur mobile responsive */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm sm:max-w-lg mx-auto lg:mx-0">
                {[
                  { value: formatTime(timeLeft.days).slice(-3), label: 'JOURS', shortLabel: 'J' },
                  { value: formatTime(timeLeft.hours), label: 'HEURES', shortLabel: 'H' },
                  { value: formatTime(timeLeft.minutes), label: 'MIN', shortLabel: 'M' },
                  { value: formatTime(timeLeft.seconds), label: 'SEC', shortLabel: 'S' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm">
                      <div className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-1 ${
                        flipAnimation[Object.keys(flipAnimation)[index]] ? 'animate-pulse' : ''
                      }`}>
                        {item.value}
                      </div>
                      <div className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                        <span className="sm:hidden">{item.shortLabel}</span>
                        <span className="hidden sm:inline">{item.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section informations et actions - mobile */}
            <div className="space-y-4 lg:space-y-6 order-2">
              {/* Card informations mobile */}
              <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-xs sm:text-sm font-medium">Date</p>
                      <p className="text-gray-900 font-semibold text-sm sm:text-base">20 septembre 2025</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-xs sm:text-sm font-medium">Lieu</p>
                      <p className="text-gray-900 font-semibold text-sm sm:text-base">CICAD - DIAMNIADIO</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-xs sm:text-sm font-medium">Horaires</p>
                      <p className="text-gray-900 font-semibold text-sm sm:text-base">09h30 - 12h30</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action mobile */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <Link href="/reserve" className="w-full">
                  <button className="group relative w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-teal-500/25 active:scale-95 sm:hover:scale-105 transform">
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm sm:text-base">Réserver ma place</span>
                    </span>
                  </button>
                </Link>
                
                <button className="group relative w-full bg-white/80 backdrop-blur-sm border-2 border-gray-300/50 hover:border-gray-400/50 text-gray-700 font-semibold py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 hover:bg-white/90 active:scale-95 sm:hover:scale-105 transform shadow-sm hover:shadow-lg">
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">
                      <span className="sm:hidden">Programme</span>
                      <span className="hidden sm:inline">Télécharger le programme</span>
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};