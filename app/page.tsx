'use client';
import Countdown from '@/components/Countdown';
import Link from 'next/link';
import { 
  ArrowRight, 
  Zap, 
  Users, 
  BookOpen, 
  Calendar,
  MapPin,
  Star,
  Sparkles,
  Brain,
  Rocket,
  Trophy
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-secondary-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative section-padding text-center">
        <div className="container-custom">
          <div className="fade-in">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium text-gray-700 mb-8 border border-gray-200/50 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2 text-primary-600" />
              L'événement IA le plus attendu de 2025
            </div>

            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 leading-none">
              <span className="gradient-text">AIKarangue</span>
              <span className="block text-4xl md:text-5xl lg:text-6xl font-light text-gray-600 mt-4">
                L'Avenir de l'Intelligence Artificielle
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Rejoignez les plus grands experts mondiaux pour explorer les dernières innovations en IA, 
              découvrir les technologies de demain et façonner l'avenir numérique.
            </p>

            <div className="mb-16">
              <div className="inline-block glass-card p-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Événement dans</h3>
                <Countdown targetDate={new Date('2025-09-20T09:00:00Z')} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/reserve" className="btn-primary text-xl px-10 py-5 flex items-center space-x-3">
                <span>Réserver ma place</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/program" className="btn-secondary text-xl px-10 py-5 flex items-center space-x-3">
                <Calendar className="w-5 h-5" />
                <span>Voir le programme</span>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Dakar, Sénégal</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>20 Septembre 2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>1700+ Participants</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Gratuit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-white/50 backdrop-blur-sm border-y border-gray-200/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '50+', label: 'Experts nationaux et internationaux', icon: Users },
              { number: '04+', label: 'Sessions & Ateliers', icon: BookOpen },
              { number: '1700+', label: 'Participants Attendus', icon: Trophy },
              { number: '5h', label: 'De Contenu Premium', icon: Brain }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center slide-up">
                  <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Pourquoi <span className="gradient-text">AIKarangue</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expérience unique pour découvrir, apprendre et innover dans l'écosystème de l'IA et du transport routier 
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'CEO ArtBeau-Rescence',
                description: 'Découvrez les dernières percées en IA générative, machine learning et deep learning avec des démonstrations exclusives.',
                color: 'bg-primary-500'
              },
              {
                icon: Users,
                title: 'Networking Premium',
                description: 'Rencontrez des leaders technologiques, entrepreneurs et chercheurs de renommée mondiale dans un cadre exceptionnel.',
                color: 'bg-secondary-800'
              },
              {
                icon: BookOpen,
                title: 'Formation Experte',
                description: 'Participez à des ateliers hands-on et masterclass animés par les meilleurs spécialistes du domaine.',
                color: 'bg-primary-600'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card-hover group">
                  <div className={`w-20 h-20 ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Speakers Preview */}
      <section className="section-padding bg-white/30 backdrop-blur-sm">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Intervenants <span className="gradient-text">d'Exception</span>
            </h2>
            <p className="text-xl text-gray-600">
              Les plus grands noms de l'IA mondiale et du transport routier seront présents du minitere du senegal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { name: 'Dr. Marie Dubois', role: 'Directrice IA - Tech Paris', avatar: '👩‍💼' },
              { name: 'Prof. Jean Martin', role: 'Chercheur - MIT Labs', avatar: '👨‍🔬' },
              { name: 'Sarah Chen', role: 'CEO - AI Innovations', avatar: '👩‍💻' }
            ].map((speaker, index) => (
              <div key={index} className="card-hover text-center">
                <div className="text-6xl mb-4">{speaker.avatar}</div>
                <h3 className="text-xl font-bold mb-2">{speaker.name}</h3>
                <p className="text-gray-600">{speaker.role}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/program" className="btn-secondary">
              Voir tous les intervenants
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-secondary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container-custom relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-medium mb-8">
              <Rocket className="w-4 h-4 mr-2" />
              Places limitées - Inscription gratuite
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Prêt à Façonner l'Avenir ?
            </h2>
            <p className="text-xl mb-12 opacity-90 leading-relaxed">
              Rejoignez-nous pour l'événement IA le plus important de l'année. 
              Une opportunité unique de découvrir les technologies qui transformeront notre monde et le transport routier.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/reserve" className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-2xl flex items-center justify-center space-x-3">
                <span>Réserver Maintenant</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/program" className="border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3">
                <Calendar className="w-5 h-5" />
                <span>Programme Détaillé</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
