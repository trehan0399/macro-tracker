import React, { useState, useRef, useEffect } from 'react';

const Chatbot = ({ onChatResponse }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! I can help you log your meals. Just tell me what you ate, like "I had 2 rotis and chana masala" or "I ate a banana and yogurt for breakfast".'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    try {
      const response = await onChatResponse(userMessage);
      let botMessage;
      
      if (response && response.needs_clarification) {
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: `I'm not sure what you mean by "${userMessage}". Could you be more specific? Here are some suggestions:`,
          suggestions: response.suggestions,
          needsClarification: true
        };
      } else if (response && response.summary) {
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.summary,
          details: response.details
        };
      } else {
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: 'I processed your request, but there was an issue with the response format.',
          isError: true
        };
      }
      setMessages(prev => {
        const updated = [...prev, botMessage];
        return updated;
      });
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I couldn\'t process that. Please try again with a different description.',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : message.isError
                  ? 'bg-red-100 text-red-800'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.suggestions && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Try saying:</p>
                  <div className="space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        • {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {message.details && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Breakdown:</p>
                  {message.details.map((detail, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      {detail.measurement || detail.quantity} {detail.food}: {detail.calories} cal, {detail.protein}g protein
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm">Processing...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white border-t border-gray-200 p-4 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tell me what you ate..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-500">
          Examples: "2 rotis and chana masala", "hand-sized chicken thigh", "fist-sized rice", "some vegetables"
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 