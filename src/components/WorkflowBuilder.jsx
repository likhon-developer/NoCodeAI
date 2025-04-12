import React, { useState, useEffect } from 'react';
import DesignerComponent from './designer/DesignerComponent';
import { LocalizationService } from '../services/LocalizationService';
import { CodeGenerationService } from '../services/CodeGenerationService';
import './WorkflowBuilder.css';

const localization = new LocalizationService();
const codeGenerator = new CodeGenerationService();

export default function WorkflowBuilder() {
  const [workflow, setWorkflow] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Handle workflow changes
  const handleWorkflowChange = (data) => {
    setWorkflow(data);
  };

  // Generate code from workflow
  const generateCodeFromWorkflow = async () => {
    if (!workflow) return;
    
    setIsGeneratingCode(true);
    try {
      // Convert workflow to a description for code generation
      const description = `Create a workflow application with the following nodes and connections:
${workflow.nodes.map(node => `- ${node.label} (${node.type})`).join('\n')}

Connections:
${workflow.edges.map(edge => {
  const sourceNode = workflow.nodes.find(n => n.id === edge.source);
  const targetNode = workflow.nodes.find(n => n.id === edge.target);
  return `- Connect ${sourceNode?.label} to ${targetNode?.label}${edge.label ? ` with label "${edge.label}"` : ''}`;
}).join('\n')}

The application should handle the data flow between these components.`;

      const code = await codeGenerator.generateCode(description, 'javascript', 'react');
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
      setGeneratedCode('// Error generating code: ' + error.message);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return (
    <div className="workflow-builder">
      <div className="workflow-header">
        <h2>{localization.t('workflowBuilder') || 'AI Workflow Builder'}</h2>
        <div className="workflow-controls">
          <button 
            className="theme-toggle" 
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            title={isDarkTheme ? localization.t('switchToLight') : localization.t('switchToDark')}
          >
            {isDarkTheme ? '☀️' : '🌙'}
          </button>
          <button 
            className="generate-button"
            onClick={generateCodeFromWorkflow}
            disabled={isGeneratingCode || !workflow}
          >
            {isGeneratingCode ? 
              localization.t('generating') || 'Generating...' : 
              localization.t('generateCode') || 'Generate Code'}
          </button>
        </div>
      </div>
      
      <div className="workflow-content">
        <div className="designer-wrapper">
          <DesignerComponent 
            onChange={handleWorkflowChange}
            isLightTheme={!isDarkTheme}
          />
        </div>
        
        {generatedCode && (
          <div className="code-preview">
            <h3>{localization.t('generatedCode') || 'Generated Code'}</h3>
            <pre>
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}
      </div>
      
      <div className="workflow-footer">
        <div className="workflow-instructions">
          <h4>{localization.t('instructions') || 'Instructions'}</h4>
          <ul>
            <li>{localization.t('dragNodes') || 'Drag nodes to position them'}</li>
            <li>{localization.t('connectPorts') || 'Click and drag from one port to another to create connections'}</li>
            <li>{localization.t('editProperties') || 'Select a node or connection to edit its properties'}</li>
            <li>{localization.t('generateApp') || 'Click "Generate Code" to create a working application from your workflow'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
