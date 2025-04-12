 import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import { LocalizationService } from '../services/LocalizationService';
import './CodeEditor.css';

const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3000');
const localization = new LocalizationService();

export default function CodeEditor() {
  const [code, setCode] = useState(localization.t('codePlaceholder'));
  const [language, setLanguage] = useState('javascript');
  const [preview, setPreview] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [theme, setTheme] = useState('vs-dark');

  useEffect(() => {
    // Listen for code updates from collaborators
    socket.on('code-update', (data) => {
      if (data.language === language) {
        setCode(data.code);
      }
    });

    // Listen for collaborator presence
    socket.on('collaborator-joined', (user) => {
      setCollaborators(prev => [...prev, user]);
    });

    socket.on('collaborator-left', (userId) => {
      setCollaborators(prev => prev.filter(user => user.id !== userId));
    });

    // Request code preview
    const previewTimer = setTimeout(() => {
      if (code.trim().length > 0) {
        socket.emit('request-preview', { code, language }, (response) => {
          setPreview(response.preview);
        });
      }
    }, 2000);

    return () => {
      socket.off('code-update');
      socket.off('collaborator-joined');
      socket.off('collaborator-left');
      clearTimeout(previewTimer);
    };
  }, [code, language]);

  const handleCodeChange = (value) => {
    setCode(value);
    // Emit code changes to collaborators
    socket.emit('code-update', { code: value, language });
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="language-select"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          className="theme-select"
        >
          <option value="vs-dark">Dark</option>
          <option value="vs-light">Light</option>
        </select>
        <div className="collaborators">
          {collaborators.map(user => (
            <div key={user.id} className="collaborator-avatar" title={user.name}>
              {user.name.charAt(0)}
            </div>
          ))}
        </div>
      </div>
      
      <div className="editor-content">
        <div className="editor-main">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme={theme}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              formatOnPaste: true,
              formatOnType: true
            }}
          />
        </div>
        
        {preview && (
          <div className="editor-preview">
            <div className="preview-header">
              {localization.t('livePreview')}
            </div>
            <iframe 
              srcDoc={preview} 
              title="Code Preview" 
              sandbox="allow-scripts"
              className="preview-frame"
            />
          </div>
        )}
      </div>
    </div>
  );
}
