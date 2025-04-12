import React from 'react';
import './ActivityBar.css';

export default function ActivityBar({ activePanel, setActivePanel, toggleSecondaryPanel }) {
  return (
    <div className="activity-bar">
      <div 
        className={`activity-icon ${activePanel === 'chat' ? 'active' : ''}`}
        onClick={() => setActivePanel('chat')}
        title="Chat Interface"
      >
        💬
      </div>
      <div 
        className={`activity-icon ${activePanel === 'code' ? 'active' : ''}`}
        onClick={() => setActivePanel('code')}
        title="Code Editor"
      >
        ✏️
      </div>
      <div 
        className="activity-icon"
        onClick={toggleSecondaryPanel}
        title="Secondary Panel"
      >
        🔍
      </div>
    </div>
  );
}
