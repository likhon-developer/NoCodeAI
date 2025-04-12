import React, { useState, useEffect, useRef } from 'react';
import { Split, Maximize2, Minimize2, Play, Save, Code, FileText, Database, Settings } from 'lucide-react';
import MDXEditorComponent from '../MDXEditor/MDXEditorComponent';
import webContainerService from '../../services/WebContainerService';
import { DatabaseService } from '../../database/db';
import './CodeSandbox.css';

const CodeSandbox = ({ projectId }) => {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello from NoCode AI Platform!");');
  const [output, setOutput] = useState('');
  const [documentation, setDocumentation] = useState('# Project Documentation\n\nWrite your project documentation here using Markdown.');
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [splitView, setSplitView] = useState(true);
  const [activeTab, setActiveTab] = useState('code');
  const [previewURL, setPreviewURL] = useState('');
  const [projectData, setProjectData] = useState(null);
  const [files, setFiles] = useState({});
  
  const terminalRef = useRef(null);
  const previewRef = useRef(null);
  
  // Initialize web container and load project data
  useEffect(() => {
    const initializeEnvironment = async () => {
      try {
        setLoading(true);
        
        // Initialize WebContainer
        await webContainerService.initialize();
        
        // Load project data if projectId is provided
        if (projectId) {
          const project = await DatabaseService.getProject(projectId);
          if (project) {
            setProjectData(project);
            
            // Set code from project data if available
            if (project.files && project.files.code) {
              setCode(project.files.code);
            }
            
            // Set documentation from project data if available
            if (project.files && project.files.documentation) {
              setDocumentation(project.files.documentation);
            }
            
            // Recreate project files in WebContainer
            if (project.files) {
              const filesMap = {};
              
              // Convert project files to WebContainer format
              Object.keys(project.files).forEach(filename => {
                if (filename !== 'code' && filename !== 'documentation') {
                  filesMap[filename] = {
                    file: {
                      contents: project.files[filename]
                    }
                  };
                }
              });
              
              // Always include main code file
              filesMap['index.js'] = {
                file: {
                  contents: project.files.code || code
                }
              };
              
              // Include package.json if not present
              if (!filesMap['package.json']) {
                filesMap['package.json'] = {
                  file: {
                    contents: JSON.stringify({
                      name: project.name || 'nocode-project',
                      version: '1.0.0',
                      description: project.description || 'NoCode AI Project',
                      main: 'index.js',
                      type: 'module',
                      scripts: {
                        start: 'node index.js'
                      }
                    }, null, 2)
                  }
                };
              }
              
              setFiles(filesMap);
              await webContainerService.setupFileSystem(filesMap);
            }
          }
        } else {
          // Set up default files for a new project
          const defaultFiles = {
            'index.js': {
              file: {
                contents: code
              }
            },
            'package.json': {
              file: {
                contents: JSON.stringify({
                  name: 'nocode-project',
                  version: '1.0.0',
                  description: 'NoCode AI Project',
                  main: 'index.js',
                  type: 'module',
                  scripts: {
                    start: 'node index.js'
                  }
                }, null, 2)
              }
            }
          };
          
          setFiles(defaultFiles);
          await webContainerService.setupFileSystem(defaultFiles);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize environment:', error);
        setOutput(`Error: ${error.message}`);
        setLoading(false);
      }
    };
    
    initializeEnvironment();
    
    // Cleanup when component unmounts
    return () => {
      webContainerService.teardown();
    };
  }, [projectId]);
  
  // Handle code changes
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };
  
  // Handle documentation changes
  const handleDocumentationChange = (newDocumentation) => {
    setDocumentation(newDocumentation);
  };
  
  // Save project
  const handleSaveProject = async () => {
    try {
      if (!projectId) {
        // Create new project
        const newProject = await DatabaseService.createProject({
          name: 'New Project',
          description: 'Created with NoCode AI Platform',
          type: 'custom',
          userId: 'user123', // This should come from auth
          settings: {},
          status: 'draft',
          files: {
            code: code,
            documentation: documentation,
            ...Object.keys(files).reduce((acc, key) => {
              if (key !== 'index.js' && key !== 'package.json') {
                acc[key] = files[key].file.contents;
              }
              return acc;
            }, {})
          }
        });
        
        setProjectData(newProject);
        setOutput('Project saved successfully!');
      } else {
        // Update existing project
        await DatabaseService.updateProject(projectId, {
          files: {
            code: code,
            documentation: documentation,
            ...Object.keys(files).reduce((acc, key) => {
              if (key !== 'index.js' && key !== 'package.json') {
                acc[key] = files[key].file.contents;
              }
              return acc;
            }, {})
          }
        });
        
        setOutput('Project updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      setOutput(`Error saving project: ${error.message}`);
    }
  };
  
  // Run the code
  const handleRunCode = async () => {
    try {
      setRunning(true);
      setOutput('Running...\n');
      
      // Update index.js with current code
      await webContainerService.writeFile('index.js', code);
      
      // Run the code
      const result = await webContainerService.runCommand('node', ['index.js']);
      
      setOutput(result.stdout || 'No output');
      if (result.stderr) {
        setOutput(prev => `${prev}\nErrors:\n${result.stderr}`);
      }
      
      setRunning(false);
    } catch (error) {
      console.error('Failed to run code:', error);
      setOutput(`Error: ${error.message}`);
      setRunning(false);
    }
  };
  
  // Run web server
  const handleStartServer = async () => {
    try {
      setRunning(true);
      setOutput('Starting server...\n');
      
      // Create a simple Express server file if it doesn't exist
      const serverFileExists = await webContainerService.readFile('server.js').catch(() => false);
      
      if (!serverFileExists) {
        const serverCode = `
import express from 'express';
const app = express();
const port = 3000;

app.use(express.static('.'));

app.get('/', (req, res) => {
  res.send('<h1>Hello from NoCode AI Platform!</h1>');
});

app.get('/api/data', (req, res) => {
  res.json({
    message: 'This is data from the API',
    timestamp: new Date()
  });
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
`;
        
        await webContainerService.writeFile('server.js', serverCode);
        
        // Update package.json for Express
        const packageJson = JSON.parse(await webContainerService.readFile('package.json'));
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.dependencies.express = '^4.18.2';
        await webContainerService.writeFile('package.json', JSON.stringify(packageJson, null, 2));
        
        // Install Express
        setOutput(prev => `${prev}\nInstalling Express...\n`);
        await webContainerService.installPackages(['express']);
      }
      
      // Start the server
      const serverProcess = await webContainerService.runCommand('node', ['server.js']);
      
      // Get the preview URL
      const url = await webContainerService.getPreviewURL(3000);
      setPreviewURL(url);
      
      setOutput(prev => `${prev}\nServer running! Preview available in the preview tab.\n`);
      setActiveTab('preview');
      setRunning(false);
    } catch (error) {
      console.error('Failed to start server:', error);
      setOutput(`Error: ${error.message}`);
      setRunning(false);
    }
  };
  
  // Toggle split view
  const toggleSplitView = () => {
    setSplitView(!splitView);
  };
  
  // Create a new file
  const handleCreateFile = async () => {
    const filename = prompt('Enter filename:');
    if (!filename) return;
    
    try {
      const newFiles = { ...files };
      newFiles[filename] = {
        file: {
          contents: ''
        }
      };
      
      await webContainerService.writeFile(filename, '');
      setFiles(newFiles);
      setOutput(`File ${filename} created successfully!`);
    } catch (error) {
      console.error(`Failed to create file ${filename}:`, error);
      setOutput(`Error creating file: ${error.message}`);
    }
  };
  
  return (
    <div className="code-sandbox">
      <div className="sandbox-header">
        <div className="project-info">
          <h3>{projectData?.name || 'New Project'}</h3>
          <p>{projectData?.description || 'NoCode AI Platform'}</p>
        </div>
        
        <div className="sandbox-actions">
          <button 
            className="action-button"
            onClick={toggleSplitView}
            title={splitView ? 'Maximize Editor' : 'Split View'}
          >
            {splitView ? <Maximize2 size={18} /> : <Split size={18} />}
          </button>
          
          <button 
            className="action-button"
            onClick={handleSaveProject}
            title="Save Project"
          >
            <Save size={18} />
          </button>
          
          <button 
            className="action-button primary"
            onClick={handleRunCode}
            disabled={running}
            title="Run Code"
          >
            <Play size={18} />
            Run
          </button>
          
          <button 
            className="action-button"
            onClick={handleStartServer}
            disabled={running}
            title="Start Web Server"
          >
            <Code size={18} />
            Server
          </button>
        </div>
      </div>
      
      <div className={`sandbox-content ${splitView ? 'split' : ''}`}>
        <div className="editor-container">
          <div className="editor-tabs">
            <button 
              className={activeTab === 'code' ? 'active' : ''}
              onClick={() => setActiveTab('code')}
            >
              <Code size={16} />
              Code
            </button>
            
            <button 
              className={activeTab === 'docs' ? 'active' : ''}
              onClick={() => setActiveTab('docs')}
            >
              <FileText size={16} />
              Documentation
            </button>
            
            <button 
              className={activeTab === 'db' ? 'active' : ''}
              onClick={() => setActiveTab('db')}
            >
              <Database size={16} />
              Database
            </button>
            
            <button 
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
          
          <div className="editor-content">
            {activeTab === 'code' && (
              <div className="code-editor">
                {/* Use Monaco Editor or other code editor here */}
                <textarea
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="Write your JavaScript code here..."
                />
              </div>
            )}
            
            {activeTab === 'docs' && (
              <MDXEditorComponent
                initialContent={documentation}
                onSave={handleDocumentationChange}
                projectId={projectId}
              />
            )}
            
            {activeTab === 'db' && (
              <div className="database-editor">
                <h3>Database</h3>
                <p>RxDB-powered local database management</p>
                <div className="database-actions">
                  <button>Create Collection</button>
                  <button>View Data</button>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="settings-editor">
                <h3>Project Settings</h3>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Project Name</label>
                    <input 
                      type="text" 
                      value={projectData?.name || 'New Project'} 
                      onChange={() => {}} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      value={projectData?.description || ''} 
                      onChange={() => {}}
                    />
                  </div>
                  
                  <h4>Files</h4>
                  <div className="file-list">
                    {Object.keys(files).map(filename => (
                      <div key={filename} className="file-item">
                        {filename}
                      </div>
                    ))}
                    <button className="add-file" onClick={handleCreateFile}>
                      + Add File
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {splitView && (
          <div className="output-container">
            <div className="output-tabs">
              <button 
                className={activeTab === 'output' ? 'active' : ''}
                onClick={() => setActiveTab('output')}
              >
                Output
              </button>
              
              <button 
                className={activeTab === 'preview' ? 'active' : ''}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </button>
            </div>
            
            <div className="output-content">
              {activeTab === 'output' && (
                <pre ref={terminalRef} className="terminal">
                  {loading ? 'Initializing environment...' : output || 'Run your code to see output here'}
                </pre>
              )}
              
              {activeTab === 'preview' && (
                <div className="preview-frame">
                  {previewURL ? (
                    <iframe
                      ref={previewRef}
                      src={previewURL}
                      title="Preview"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  ) : (
                    <div className="no-preview">
                      <p>Start a web server to see a preview here</p>
                      <button onClick={handleStartServer}>Start Server</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeSandbox;
