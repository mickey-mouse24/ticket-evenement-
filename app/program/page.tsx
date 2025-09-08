'use client';

export default function ProgramPage() {
  const schedule = [
    {
      time: '09:00 - 09:30',
      title: 'Accueil et petit-déjeuner',
      speaker: '',
      description: 'Accueil des participants avec petit-déjeuner et networking'
    },
    {
      time: '09:30 - 10:30',
      title: 'Keynote : L\'avenir de l\'IA',
      speaker: 'Dr. Marie Dubois',
      description: 'Une vision prospective sur les développements futurs de l\'intelligence artificielle et son impact sur la société.'
    },
    {
      time: '10:30 - 11:00',
      title: 'Pause café',
      speaker: '',
      description: 'Networking et discussions informelles'
    },
    {
      time: '11:00 - 12:00',
      title: 'IA et Éthique : Défis et Solutions',
      speaker: 'Prof. Jean Martin',
      description: 'Exploration des enjeux éthiques liés au développement et déploiement des systèmes d\'IA.'
    },
    {
      time: '12:00 - 13:30',
      title: 'Déjeuner',
      speaker: '',
      description: 'Déjeuner networking avec tous les participants'
    },
    {
      time: '13:30 - 14:30',
      title: 'IA Générative : Révolution Créative',
      speaker: 'Sarah Chen',
      description: 'Comment l\'IA générative transforme les industries créatives et ouvre de nouvelles possibilités.'
    },
    {
      time: '14:30 - 15:30',
      title: 'Atelier : Développer avec l\'IA',
      speaker: 'Équipe AIKarangue',
      description: 'Atelier pratique sur l\'intégration d\'outils IA dans vos projets de développement.'
    },
    {
      time: '15:30 - 16:00',
      title: 'Pause',
      speaker: '',
      description: 'Pause et networking'
    },
    {
      time: '16:00 - 17:00',
      title: 'Table ronde : IA en Entreprise',
      speaker: 'Panel d\'experts',
      description: 'Discussion avec des dirigeants sur l\'adoption de l\'IA en entreprise.'
    },
    {
      time: '17:00 - 17:30',
      title: 'Clôture et networking',
      speaker: '',
      description: 'Synthèse de la journée et dernières opportunités de networking'
    }
  ];

  const speakers = [
    {
      name: 'Dr. Marie Dubois',
      title: 'Directrice de Recherche IA',
      company: 'Institut Technologique de Paris',
      image: '/api/placeholder/150/150',
      bio: 'Experte reconnue en IA avec plus de 15 ans d\'expérience en recherche et développement.'
    },
    {
      name: 'Prof. Jean Martin',
      title: 'Professeur d\'Éthique Numérique',
      company: 'Université de Lyon',
      image: '/api/placeholder/150/150',
      bio: 'Spécialiste des questions éthiques liées aux nouvelles technologies et à l\'IA.'
    },
    {
      name: 'Sarah Chen',
      title: 'CEO & Fondatrice',
      company: 'CreativeAI Labs',
      image: '/api/placeholder/150/150',
      bio: 'Entrepreneuse et innovatrice dans le domaine de l\'IA créative et générative.'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Programme AIKarangue 2025</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une journée complète dédiée à l'intelligence artificielle avec des experts internationaux, 
            des ateliers pratiques et des opportunités de networking uniques.
          </p>
          <div className="mt-8 inline-flex items-center space-x-4 text-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              20 Septembre 2025
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Centre de Conférences Abdou Diouf , Diamnadio
            </div>
          </div>
        </div>

        {/* Schedule */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Programme de la journée</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {schedule.map((session, index) => (
              <div key={index} className="card hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="md:w-1/4 mb-4 md:mb-0">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {session.time}
                    </span>
                  </div>
                  <div className="md:w-3/4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{session.title}</h3>
                    {session.speaker && (
                      <p className="text-blue-600 font-medium mb-2">{session.speaker}</p>
                    )}
                    <p className="text-gray-600">{session.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Speakers */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nos Intervenants</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {speakers.map((speaker, index) => (
              <div key={index} className="card text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{speaker.name}</h3>
                <p className="text-blue-600 font-medium mb-1">{speaker.title}</p>
                <p className="text-gray-500 text-sm mb-3">{speaker.company}</p>
                <p className="text-gray-600 text-sm">{speaker.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Practical Info */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Informations Pratiques</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Lieu
              </h3>
              <p className="text-gray-600 mb-2">Centre de Conférences Paris</p>
              <p className="text-gray-600 mb-2">123 Avenue des Champs-Élysées</p>
              <p className="text-gray-600">75008 Paris, France</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Inclus
              </h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Petit-déjeuner et déjeuner</li>
                <li>• Toutes les sessions et ateliers</li>
                <li>• Kit participant avec goodies</li>
                <li>• Accès networking VIP</li>
                <li>• Certificat de participation</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
