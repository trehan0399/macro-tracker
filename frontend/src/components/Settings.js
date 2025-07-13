import React, { useState } from 'react';

const Settings = ({ maintenanceCalories, onUpdateMaintenanceCalories }) => {
  const [calories, setCalories] = useState(maintenanceCalories);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const caloriesInt = parseInt(calories);
      if (isNaN(caloriesInt) || caloriesInt <= 0) {
        throw new Error('Please enter a valid positive number for calories');
      }

      await onUpdateMaintenanceCalories(caloriesInt);
      setMessage('Maintenance calories updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Error updating maintenance calories');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCalories(maintenanceCalories);
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Maintenance Calories
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Set your daily calorie target. This will be displayed as a reference line on your weekly chart.
        </p>

        {message && (
          <div className={`p-3 rounded-md text-sm mb-4 ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="maintenance-calories" className="block text-sm font-medium text-gray-700 mb-1">
              Daily Calorie Target
            </label>
            <input
              type="number"
              id="maintenance-calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              min="1"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 2000"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Current target: {maintenanceCalories} calories per day
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Target'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          About Macro Tracker
        </h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>Version:</strong> 1.0.0
          </p>
          <p>
            <strong>Features:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Manual food entry with detailed nutrition tracking</li>
            <li>AI-powered chatbot for natural language food logging</li>
            <li>Weekly nutrition charts with calorie and protein tracking</li>
            <li>Maintenance calorie target setting and visualization</li>
            <li>Mobile-responsive design</li>
          </ul>
          
          <p className="mt-4">
            <strong>APIs Used:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>OpenAI GPT for natural language processing</li>
            <li>Nutritionix for food database and nutrition information</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          💡 Tips for Better Tracking
        </h3>
        
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Use the chatbot for quick logging: "I had 2 rotis and chana masala"</p>
          <p>• Set realistic maintenance calorie targets based on your goals</p>
          <p>• Check the weekly chart to see your progress trends</p>
          <p>• Use the manual entry for precise nutrition information</p>
          <p>• Filter food logs by date to review specific days</p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 