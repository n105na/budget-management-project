import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, AlertTriangle, DollarSign, Target } from 'lucide-react';
import { fetchWithAuth } from '../src/utils/fetchWithAuth';

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('this_year');
  const [dashboardData, setDashboardData] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [missionsError, setMissionsError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const filterOptions = [
    { key: 'this_year', label: 'This Year' },
    { key: 'this_quarter', label: 'This Quarter' },
    { key: 'this_month', label: 'This Month' },
    { key: 'this_week', label: 'This Week' }
  ];

  // Real API call function for dashboard data
  const fetchDashboardData = async (filter) => {
    setLoading(true);
    setError(null);
    console.log('Fetching dashboard data for filter:', filter);
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/dashboard/?filter=${filter}`, {
        method: 'GET',
      });

      //console.log('Dashboard API Response status:', response.status);
      //console.log('Dashboard API Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);
        setDashboardData(data);
      } else {
        const errorText = await response.text();
        console.error('Dashboard API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}...`);
      }
    } catch (err) {
      const errorMessage = err.message
      setError(errorMessage);
      console.error('Dashboard API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all missions
  const fetchMissions = async () => {
    setMissionsLoading(true);
    setMissionsError(null);
    
    try {
      const res = await fetchWithAuth(`${API_URL}/api/mission-personnel/`, {
        method: "GET",
      });

      console.log('Missions API Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Missions API Error Response:', errorText);
        throw new Error(`HTTP ${res.status}: Failed to fetch missions`);
      }

      // Check if response is actually JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await res.text();
        console.error('Missions API returned non-JSON response:', responseText);
        throw new Error('Missions API returned HTML instead of JSON. Check your API endpoint and authentication.');
      }

      const data = await res.json();
      console.log("Missions data received:", data);
      
      setMissions(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.message.includes('Unexpected token') 
        ? 'Missions API returned HTML instead of JSON. Please check your API endpoint and authentication.'
        : `Failed to load missions data: ${err.message}`;
        
      setMissionsError(errorMessage);
      console.error("Missions API Error:", err);
    } finally {
      setMissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(activeFilter);
    fetchMissions();
  }, [activeFilter]);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0.00 DA';
    }
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mission Management Dashboard</h1>
          <p className="text-gray-600">Monitor and track mission activities and budget usage</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setActiveFilter(option.key)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeFilter === option.key
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {(loading || missionsLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading data...</span>
          </div>
        )}

        {/* Error States */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Dashboard API Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {missionsError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Missions API Error</h3>
                <p className="text-sm text-yellow-700 mt-1">{missionsError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {dashboardData && !loading && (
          <>
            {/* Warning Banner */}
            {dashboardData.warning && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-orange-700 font-medium">{dashboardData.warning}</span>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Missions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {dashboardData.total_missions || 0}
                  </h3>
                  <p className="text-sm text-gray-500">Total Missions</p>
                  <p className="text-xs text-blue-600">Currently active</p>
                </div>
              </div>

              {/* Personnel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 rounded-lg p-2">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {dashboardData.unique_personnel || 0}
                  </h3>
                  <p className="text-sm text-gray-500">Personnel</p>
                  <p className="text-xs text-green-600">Active staff</p>
                </div>
              </div>

              {/* Total Budget */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 rounded-lg p-2">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboardData.budget_amount)}
                  </h3>
                  <p className="text-sm text-gray-500">Total Budget</p>
                  <p className="text-xs text-gray-400">
                    {dashboardData.percent_used ? `${dashboardData.percent_used.toFixed(1)}% used` : '0% used'}
                  </p>
                </div>
              </div>

              {/* Total Spent */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${dashboardData.is_overspent ? 'bg-red-100' : 'bg-orange-100'} rounded-lg p-2`}>
                    <DollarSign className={`h-6 w-6 ${dashboardData.is_overspent ? 'text-red-600' : 'text-orange-600'}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboardData.total_spent)}
                  </h3>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className={`text-xs ${dashboardData.is_overspent ? 'text-red-600' : 'text-orange-600'}`}>
                    {dashboardData.is_overspent ? 'Over budget' : 'Within budget'}
                  </p>
                </div>
              </div>
            </div>

            {/* Period Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Period: {formatDate(dashboardData.start)} - {formatDate(dashboardData.end)}</span>
                <span className="mx-4">•</span>
                <span>Remaining Budget: </span>
                <span className={`ml-1 font-medium ${
                  (dashboardData.remaining_budget || 0) < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(dashboardData.remaining_budget)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Missions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Missions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personnel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {missionsLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Loading missions...
                      </div>
                    </td>
                  </tr>
                ) : missionsError ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-red-500">
                      <div className="flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Failed to load missions
                      </div>
                    </td>
                  </tr>
                ) : missions.length > 0 ? (
                  missions.map((mission, index) => (
                    <tr key={mission.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{mission.id || index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 capitalize">
                            {mission.destination_name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                             {(mission.date_departure && mission.date_arrival 
                               ? `${formatDate(mission.date_departure)} - ${formatDate(mission.date_arrival)}`
                               : 'N/A')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {`${mission.personnel_details.length} Personnels` || 'Personnel'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mission.personnel_details.reduce((sum, person) => sum + person.total_payment, 0)}DA
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No missions found for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;