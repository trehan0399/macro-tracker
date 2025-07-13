import React, { useState } from 'react';

const FoodLogs = ({ logs, onDeleteLog, onClearAllLogs }) => {
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [filterDate, setFilterDate] = useState(getCurrentDate());
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [clearAllLoading, setClearAllLoading] = useState(false);

  const handleDelete = async (logId) => {
    if (window.confirm('Are you sure you want to delete this food log?')) {
      setDeleteLoading(logId);
      try {
        await onDeleteLog(logId);
      } catch (error) {
        console.error('Error deleting log:', error);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL food logs? This action cannot be undone.')) {
      setClearAllLoading(true);
      try {
        await onClearAllLogs();
      } catch (error) {
        console.error('Error clearing all logs:', error);
      } finally {
        setClearAllLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = filterDate 
    ? logs.filter(log => log.date === filterDate)
    : logs;

  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = log.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b) - new Date(a));

  const calculateDailyTotals = (dayLogs) => {
    return dayLogs.reduce((totals, log) => ({
      calories: totals.calories + log.calories,
      protein: totals.protein + log.protein
    }), { calories: 0, protein: 0 });
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <label htmlFor="filter-date" className="block text-sm font-medium text-gray-700">
            Filter by Date
          </label>
          {logs.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearAllLoading}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {clearAllLoading ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>
        <input
          type="date"
          id="filter-date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate('')}
            className="ml-2 text-sm text-primary-600 hover:text-primary-700"
          >
            Show All
          </button>
        )}
      </div>
      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No food logs for this date</h3>
          <p className="text-gray-500">Try adding some food entries or change the date filter!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const dayLogs = groupedLogs[date];
            const dailyTotals = calculateDailyTotals(dayLogs);
            return (
              <div key={date} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatDate(date)}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {dayLogs.length} item{dayLogs.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {dailyTotals.calories.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {dailyTotals.protein.toFixed(1)}g
                      </div>
                      <div className="text-xs text-gray-500">Protein</div>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {dayLogs.map((log) => (
                    <div key={log.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{log.food_name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatTime(log.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right text-sm">
                            <div className="font-medium text-gray-900">
                              {log.calories.toFixed(0)} cal
                            </div>
                            <div className="text-gray-500">
                              P: {log.protein.toFixed(1)}g
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(log.id)}
                            disabled={deleteLoading === log.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete this food log"
                          >
                            {deleteLoading === log.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FoodLogs; 