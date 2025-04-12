import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { LocalizationService } from '../services/LocalizationService';
import './ChatInterface.css';

const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3000');
const localization = new LocalizationService();

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    socket.on('chat-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off('chat-message');
  }, []);

  const handleSend = () => {
    if (inputValue.trim()) {
      const userMsg = { text: inputValue, sender: 'user' };
      setMessages(prev => [...prev, userMsg]);
      socket.emit('chat-message', userMsg);
      
      // Get AI response
      socket.emit('get-ai-response', inputValue, (aiResponse) => {
        setMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }]);
      });
      
      setInputValue('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={localization.t('chatPlaceholder')}
        />
        <button onClick={handleSend}>{localization.t('send')}</button>
      </div>
    </div>
  );
}
