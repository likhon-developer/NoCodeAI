import React, { useState, useEffect } from 'react';
import { Code, Database, FileText, Layers, Image, Settings, Moon, Sun } from 'lucide-react';
import MDXEditorComponent from './MDXEditor/MDXEditorComponent';
import { DatabaseService } from '../database/db';
import './App.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoDoc, setDemoDoc] = useState('# Welcome to NoCode AI Platform\n\nThis is a demonstration of our MDX editor component. You can:\n\n- Create rich text content\n- Add code blocks\n- Insert images\n- Create tables\n\n```javascript\n// Sample code\nconst greeting = "Hello, world!";\nconsole.log(greeting);\n```\n\n## Features\n\nOur platform offers powerful tools for building AI-powered applications without code.');
  
  // Load projects from database
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // For demo purposes, we'll use a userId
        const userId = 'demo-user-123';
        const projectList = await DatabaseService.getProjects(userId);
        setProjects(projectList);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  // Toggle dark/light mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-theme');
  };
  
  // Create a new project demo
  const handleCreateProject = async () => {
    try {
      setLoading(true);
      const newProject = await DatabaseService.createProject({
        name: 'My New Project',
        description: 'Created with NoCode AI Platform',
        type: 'custom',
        userId: 'demo-user-123',
        settings: {},
        status: 'draft'
      });
      
      setProjects(prev => [...prev, newProject]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      setLoading(false);
    }
  };
  
  // Render different content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="welcome-screen">
            <h1>Welcome to NoCode AI Platform</h1>
            <p>Build AI-powered applications without code</p>
            
            <div className="feature-grid">
              <div className="feature-card">
                <Layers size={32} />
                <h3>Page Builder</h3>
                <p>Create beautiful, responsive web pages with drag-and-drop</p>
              </div>
              
              <div className="feature-card">
                <Database size={32} />
                <h3>Database Builder</h3>
                <p>Design and manage your data visually</p>
              </div>
              
              <div className="feature-card">
                <Code size={32} />
                <h3>Code Sandbox</h3>
                <p>Write and run Node.js code directly in the browser</p>
              </div>
              
              <div className="feature-card">
                <Image size={32} />
                <h3>AI Image Generation</h3>
                <p>Create stunning images with AI</p>
              </div>
            </div>
            
            <button className="btn-primary" onClick={() => setActiveTab('projects')}>
              Get Started
            </button>
          </div>
        );
        
      case 'projects':
        return (
          <div className="projects-screen">
            <div className="screen-header">
              <h2>My Projects</h2>
              <button className="btn-primary" onClick={handleCreateProject}>
                New Project
              </button>
            </div>
            
            <div className="projects-grid">
              {loading ? (
                <p>Loading projects...</p>
              ) : projects.length === 0 ? (
                <div className="empty-state">
                  <p>You don't have any projects yet.</p>
                  <button className="btn-primary" onClick={handleCreateProject}>
                    Create Your First Project
                  </button>
                </div>
              ) : (
                projects.map(project => (
                  <div key={project.id} className="project-card">
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div className="project-footer">
                      <span>Created: {new Date(project.created).toLocaleDateString()}</span>
                      <button className="btn-secondary">Open</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
        
      case 'editor':
        return (
          <div className="editor-screen">
            <div className="screen-header">
              <h2>Documentation Editor</h2>
            </div>
            
            <MDXEditorComponent
              initialContent={demoDoc}
              onSave={(content) => setDemoDoc(content)}
            />
          </div>
        );
        
      case 'database':
        return (
          <div className="database-screen">
            <div className="screen-header">
              <h2>Database Demo</h2>
            </div>
            
            <div className="database-demo">
              <p>This is a demonstration of our RxDB integration with offline-first capabilities.</p>
              
              <div className="database-stats">
                <div className="stat-card">
                  <h3>Projects</h3>
                  <p className="stat-value">{projects.length}</p>
                </div>
                
                <div className="stat-card">
                  <h3>Status</h3>
                  <p className="stat-value">{navigator.onLine ? 'Online' : 'Offline'}</p>
                </div>
                
                <div className="stat-card">
                  <h3>Storage</h3>
                  <p className="stat-value">IndexedDB</p>
                </div>
              </div>
              
              <button className="btn-primary" onClick={handleCreateProject}>
                Create Test Project
              </button>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="settings-screen">
            <div className="screen-header">
              <h2>Settings</h2>
            </div>
            
            <div className="settings-form">
              <div className="form-group">
                <label>Theme</label>
                <div className="theme-switcher">
                  <button
                    className={darkMode ? 'active' : ''}
                    onClick={() => setDarkMode(true)}
                  >
                    <Moon size={16} />
                    Dark
                  </button>
                  <button
                    className={!darkMode ? 'active' : ''}
                    onClick={() => setDarkMode(false)}
                  >
                    <Sun size={16} />
                    Light
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>User ID</label>
                <input type="text" value="demo-user-123" readOnly />
                <p className="form-help">This is a demo ID for demonstration purposes.</p>
              </div>
              
              <div className="form-group">
                <label>RxDB Status</label>
                <div className="status-indicator online">Connected to local database</div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Select a tab</div>;
    }
  };
  
  return (
    <div className={`app ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="sidebar">
        <div className="logo">
          <h2>NoCode AI</h2>
        </div>
        
        <nav className="nav-menu">
          <button
            className={activeTab === 'home' ? 'active' : ''}
            onClick={() => setActiveTab('home')}
          >
            <Layers size={20} />
            <span>Home</span>
          </button>
          
          <button
            className={activeTab === 'projects' ? 'active' : ''}
            onClick={() => setActiveTab('projects')}
          >
            <Code size={20} />
            <span>Projects</span>
          </button>
          
          <button
            className={activeTab === 'editor' ? 'active' : ''}
            onClick={() => setActiveTab('editor')}
          >
            <FileText size={20} />
            <span>Editor</span>
          </button>
          
          <button
            className={activeTab === 'database' ? 'active' : ''}
            onClick={() => setActiveTab('database')}
          >
            <Database size={20} />
            <span>Database</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
          
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
