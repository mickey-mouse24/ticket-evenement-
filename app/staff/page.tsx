'use client';
import { useState, useEffect } from 'react';

interface Reservation {
  id: string;
  qrcode: string;
  status: string;
  createdAt: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default function StaffDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string>('');
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    message: string;
    reservation?: Reservation;
  } | null>(null);
  const [stats, setStats] = useState({
    totalReservations: 0,
    checkedIn: 0,
    remaining: 0
  });

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    try {
      const res = await fetch('/api/staff/reservations');
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des réservations');
      }
      const data = await res.json();
      setReservations(data.reservations || []);
      
      // Calculer les stats
      const total = data.reservations.length;
      const checkedIn = data.reservations.filter((r: Reservation) => r.checkedIn).length;
      setStats({
        totalReservations: total,
        checkedIn,
        remaining: total - checkedIn
      });
    } catch (err) {
      setError('Impossible de charger les réservations');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleScan() {
    if (!scanResult.trim()) {
      setLastScanResult({
        success: false,
        message: 'Veuillez saisir ou scanner un QR code'
      });
      return;
    }

    try {
      const res = await fetch('/api/staff/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrcode: scanResult.trim() }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setLastScanResult({
          success: true,
          message: 'Check-in réussi !',
          reservation: data.reservation
        });
        // Recharger les données
        loadReservations();
      } else {
        setLastScanResult({
          success: false,
          message: data.error || 'Erreur lors du check-in'
        });
      }
    } catch (err) {
      setLastScanResult({
        success: false,
        message: 'Erreur de connexion'
      });
    }

    setScanResult('');
  }

  async function manualCheckin(reservationId: string) {
    try {
      const res = await fetch(`/api/staff/checkin/${reservationId}`, {
        method: 'POST',
      });

      if (res.ok) {
        loadReservations();
      } else {
        alert('Erreur lors du check-in');
      }
    } catch (err) {
      alert('Erreur de connexion');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord Staff</h1>
          <p className="text-gray-600">Gestion des entrées et check-in des participants</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total réservations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Check-in effectués</p>
                <p className="text-2xl font-bold text-gray-900">{stats.checkedIn}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.remaining}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Scanner QR Code</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code ou ID de réservation
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Scanner ou saisir le QR code..."
                    value={scanResult}
                    onChange={(e) => setScanResult(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                  />
                  <button
                    onClick={handleScan}
                    className="btn-primary px-6"
                  >
                    Vérifier
                  </button>
                </div>
              </div>

              {/* Scan Result */}
              {lastScanResult && (
                <div className={`p-4 rounded-xl ${
                  lastScanResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      lastScanResult.success ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        lastScanResult.success ? 'text-green-600' : 'text-red-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d={lastScanResult.success ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className={`font-medium ${
                        lastScanResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {lastScanResult.message}
                      </p>
                      {lastScanResult.reservation && (
                        <p className={`text-sm ${
                          lastScanResult.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {lastScanResult.reservation.user.name} - {lastScanResult.reservation.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Instructions */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Scanner le QR code du participant avec votre appareil</li>
                  <li>• Ou saisir manuellement le code de réservation</li>
                  <li>• Vérifier l'identité du participant</li>
                  <li>• Confirmer le check-in</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Check-ins récents</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reservations
                .filter(r => r.checkedIn)
                .sort((a, b) => new Date(b.checkedInAt || '').getTime() - new Date(a.checkedInAt || '').getTime())
                .slice(0, 10)
                .map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{reservation.user.name}</p>
                        <p className="text-xs text-gray-600">{reservation.user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {reservation.checkedInAt && new Date(reservation.checkedInAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              
              {reservations.filter(r => r.checkedIn).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>Aucun check-in effectué pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Reservations */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Toutes les réservations</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{reservation.user.name}</div>
                          <div className="text-sm text-gray-500">{reservation.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reservation.status === 'CONFIRMED' ? 'Confirmée' : 'Annulée'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reservation.checkedIn ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Check-in effectué
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!reservation.checkedIn && reservation.status === 'CONFIRMED' && (
                        <button
                          onClick={() => manualCheckin(reservation.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Check-in manuel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
