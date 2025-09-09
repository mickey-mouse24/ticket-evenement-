'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Ticket {
  id: string;
  unique_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  fonction: string;
  checked_in: boolean;
  created_at: string;
  checked_in_at?: string;
  qrcode?: string;
}

interface DashboardStats {
  overview: {
    total_tickets: number;
    checked_in: number;
    pending: number;
    attendance_rate: string;
    total_places: number;
    available_places: number;
    reserved_places: number;
    occupation_rate: string;
    unique_ids_generated: number;
    unique_ids_assigned: number;
    unique_ids_available: number;
  };
  activity: {
    tickets_today: number;
    checkins_today: number;
    tickets_this_week: number;
    recent_checkins: number;
  };
  analytics: {
    top_companies: Array<{
      name: string;
      total: number;
      checked_in: number;
      rate: string;
    }>;
    top_functions: Array<{
      name: string;
      count: number;
    }>;
    daily_evolution: Array<{
      date: string;
      tickets: number;
      checkins: number;
    }>;
  };
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'checked_in' | 'pending'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true); // Actualisation silencieuse
    }, 30000); // Actualisation toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      } else {
        setRefreshing(true);
      }

      // Charger les statistiques détaillées
      const [statsResponse, ticketsResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/tickets')
      ]);

      const statsData = await statsResponse.json();
      const ticketsData = await ticketsResponse.json();

      if (statsData.success) {
        setStats(statsData.stats);
      } else {
        throw new Error(statsData.message || 'Erreur lors du chargement des statistiques');
      }

      if (ticketsData.success) {
        setTickets(ticketsData.tickets || []);
      } else {
        throw new Error(ticketsData.message || 'Erreur lors du chargement des tickets');
      }

    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTicketAction = async (action: string, ticketId?: string, ticketIds?: string[]) => {
    try {
      const response = await fetch('/api/admin/actions', {
        method: ticketIds ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ticketId,
          ticketIds
        })
      });

      const result = await response.json();
      if (result.success) {
        // Recharger les données après l'action
        loadData();
        setSelectedTickets([]);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erreur action:', error);
      alert('Erreur lors de l\'exécution de l\'action');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'checked_in') return ticket.checked_in;
    if (filter === 'pending') return !ticket.checked_in;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                AI
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-gray-600">AI-Karangué 2025 - Gestion de l'événement</p>
              </div>
            </div>
            <Link 
              href="/"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">Erreur: {error}</span>
              <button onClick={() => loadData()} className="ml-4 text-red-600 hover:text-red-800 underline">
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Indicateur de rafraichissement */}
        {refreshing && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center text-blue-800">
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Actualisation des données...</span>
            </div>
          </div>
        )}

        {/* Statistiques principales */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Tickets</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.overview.total_tickets}</p>
                    <p className="text-xs text-gray-500 mt-1">Sur {stats.overview.total_places} places</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Check-ins</p>
                    <p className="text-3xl font-bold text-green-600">{stats.overview.checked_in}</p>
                    <p className="text-xs text-green-500 mt-1">{stats.overview.attendance_rate}% de participation</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">En attente</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.overview.pending}</p>
                    <p className="text-xs text-gray-500 mt-1">Tickets non utilisés</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Places disponibles</p>
                    <p className="text-3xl font-bold text-indigo-600">{stats.overview.available_places}</p>
                    <p className="text-xs text-indigo-500 mt-1">{stats.overview.occupation_rate}% occupation</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Activité récente */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p className="text-gray-600 text-sm">Aujourd'hui</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activity.tickets_today}</p>
                <p className="text-xs text-gray-500">Nouveaux tickets</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p className="text-gray-600 text-sm">Check-ins aujourd'hui</p>
                <p className="text-2xl font-bold text-green-600">{stats.activity.checkins_today}</p>
                <p className="text-xs text-gray-500">Participants arrivés</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p className="text-gray-600 text-sm">Cette semaine</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activity.tickets_this_week}</p>
                <p className="text-xs text-gray-500">Nouvelles réservations</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p className="text-gray-600 text-sm">Activité récente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.activity.recent_checkins}</p>
                <p className="text-xs text-gray-500">2 dernières heures</p>
              </div>
            </div>

            {/* Analyses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top entreprises */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Entreprises</h3>
                <div className="space-y-3">
                  {stats.analytics.top_companies.slice(0, 5).map((company, index) => (
                    <div key={company.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-500">{company.checked_in}/{company.total} participants</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-semibold">{company.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top fonctions */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Fonctions</h3>
                <div className="space-y-3">
                  {stats.analytics.top_functions.slice(0, 5).map((func, index) => (
                    <div key={func.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <p className="font-medium text-gray-900">{func.name}</p>
                      </div>
                      <span className="text-blue-600 font-semibold">{func.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            href="/verify"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Vérifier Tickets</h3>
                <p className="text-gray-600 text-sm">Interface de vérification des tickets</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/scanner-simple.html"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Scanner QR</h3>
                <p className="text-gray-600 text-sm">Scanner les codes QR des participants</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/reserve"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nouvelle Réservation</h3>
                <p className="text-gray-600 text-sm">Créer une réservation manuellement</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Informations système */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Système</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Événement</h3>
              <p className="text-gray-600">AI-Karangué 2025</p>
              <p className="text-gray-600">20 septembre 2025, 09h30-12h30</p>
              <p className="text-gray-600">CICAD - DIAMNIADIO, Sénégal</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Statut du système</h3>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">API opérationnelle</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Base de données connectée</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Génération QR active</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
