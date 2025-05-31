import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../src//utils/fetchWithAuth';

const Reports = ({ user }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Check if user is admin
    const isAdmin = 'True';
    
    const loadLogs = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`${API_URL}/api/core/logs/`);
        console.log('API response:', response.status, response); // Debug
        if (response.ok) {
          setError(null);
          const data = await response.json();
          console.log('Logs data:', data); // Debug
          setLogs(data.results || data);
        } else if (response.status === 403) {
            setError('You are not an admin');}
            else {setError(`Failed to load logs. Status: ${response.status}`);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error loading logs');
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (isAdmin) {
        loadLogs();
      } else {
        setError('Admin access required');
        setLoading(false);
      }
    }, [isAdmin]);
  
    if (!isAdmin) {
      return (
        <div style={{ color: 'red', fontSize: '20px', margin: '20px' }}>
          Access denied. Admin privileges required.
        </div>
      );
    }
  
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      );
    }
  
    return (
      <div className="p-6 max-w-6xl mx-auto">
        {/* Error message */}
        {error && (
          <div style={{ color: 'red', fontSize: '20px', margin: '20px' }}>
            {error}
          </div>
        )}
  
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <p className="text-3xl font-bold text-[#00064d] w-full">Activity Logs</p>
          </div>
  
          {/* Logs Table */}
          <div className="overflow-x-auto ">
            <table className="w-full ">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-full">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Object
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-full">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 w-full">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.action_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.content_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.object_repr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.action_flag === 'Addition'
                            ? 'bg-green-100 text-green-800'
                            : log.action_flag === 'Change'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.action_flag}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.change_message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No activity logs found.
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default Reports;