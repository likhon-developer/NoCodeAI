import React, { useState, useEffect, useRef } from 'react';
import { LocalizationService } from '../../services/LocalizationService';
import { PageBuilderService } from '../../services/PageBuilderService';
import ComponentPalette from './ComponentPalette';
import EditPanel from './EditPanel';
import PreviewPane from './PreviewPane';
import './PageBuilder.css';

const localization = new LocalizationService();
const pageBuilderService = new PageBuilderService();

export default function PageBuilder({ pageId, siteId, readOnly = false }) {
  const [pageData, setPageData] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [components, setComponents] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revisions, setRevisions] = useState([]);
  const [activeRevision, setActiveRevision] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const canvasRef = useRef(null);

  // Load page data
  useEffect(() => {
    async function loadPage() {
      if (!pageId) return;
      
      try {
        setIsLoading(true);
        const page = await pageBuilderService.getPageById(pageId);
        
        if (page && page.revisions) {
          // Sort revisions by version, highest first
          const sortedRevisions = [...page.revisions].sort((a, b) => b.version - a.version);
          setRevisions(sortedRevisions);
          
          // Set active revision to the latest one
          if (sortedRevisions.length > 0) {
            setActiveRevision(sortedRevisions[0]);
            // Parse the content
            try {
              const content = JSON.parse(sortedRevisions[0].content);
              setComponents(content);
            } catch (e) {
              console.error('Failed to parse page content:', e);
              setComponents([]);
            }
          }
        }
        
        setPageData(page);
      } catch (error) {
        console.error('Failed to load page:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPage();
  }, [pageId]);

  // Set up autosave timer
  useEffect(() => {
    if (!readOnly && pageId && components.length > 0) {
      // Clear existing timer if any
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // Set new timer for 30 seconds
      const timer = setTimeout(() => {
        handleSave(true);
      }, 30000);
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [components, pageId, readOnly]);

  // Handle elements drag events
  const handleDragStart = (e, component) => {
    setIsDragging(true);
    setDraggedComponent({
      ...component,
      id: `component-${Date.now()}`
    });
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    if (isDragging) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (!isDragging || !draggedComponent) {
      return;
    }
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const dropX = e.clientX - canvasRect.left;
    const dropY = e.clientY - canvasRect.top;
    
    // Create a new component with position
    const newComponent = {
      ...draggedComponent,
      position: {
        x: dropX,
        y: dropY
      }
    };
    
    setComponents([...components, newComponent]);
    setIsDragging(false);
    setDraggedComponent(null);
  };

  // Handle element selection
  const handleSelectElement = (element) => {
    setSelectedElement(element);
  };

  // Handle element update
  const handleUpdateElement = (elementId, updates) => {
    const updatedComponents = components.map(component => 
      component.id === elementId 
        ? { ...component, ...updates }
        : component
    );
    
    setComponents(updatedComponents);
    
    // Update selected element if it's the one being edited
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  // Handle element deletion
  const handleDeleteElement = (elementId) => {
    setComponents(components.filter(component => component.id !== elementId));
    
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
  };

  // Handle saving
  const handleSave = async (isAutoSave = false) => {
    if (readOnly || !pageId || !pageData) return;
    
    try {
      setIsSaving(true);
      
      // Prepare content
      const content = JSON.stringify(components);
      
      // Update page
      await pageBuilderService.updatePage(pageId, {
        ...pageData,
        content,
        updated_at: new Date().toISOString()
      });
      
      // Update last saved time
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        // You could show a save confirmation message here
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  // Handle publishing
  const handlePublish = async () => {
    if (readOnly || !pageId || !pageData) return;
    
    try {
      setIsSaving(true);
      
      // Save current state first
      await handleSave();
      
      // Update page to published status
      await pageBuilderService.updatePage(pageId, {
        ...pageData,
        status: 'published',
        published_at: new Date().toISOString()
      });
      
      // Refresh page data
      const updatedPage = await pageBuilderService.getPageById(pageId);
      setPageData(updatedPage);
      
      // You could show a publish confirmation message here
    } catch (error) {
      console.error('Failed to publish page:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  // Handle revision switching
  const handleRevisionSwitch = (revision) => {
    try {
      const content = JSON.parse(revision.content);
      setComponents(content);
      setActiveRevision(revision);
      setSelectedElement(null);
    } catch (e) {
      console.error('Failed to parse revision content:', e);
    }
  };

  // Handle revision restoration
  const handleRestoreRevision = async () => {
    if (!activeRevision || !pageId) return;
    
    try {
      setIsSaving(true);
      await pageBuilderService.restoreRevision(pageId, activeRevision.id);
      
      // Refresh page data and revisions
      const page = await pageBuilderService.getPageById(pageId);
      
      if (page && page.revisions) {
        const sortedRevisions = [...page.revisions].sort((a, b) => b.version - a.version);
        setRevisions(sortedRevisions);
        
        // Set active revision to the latest one
        if (sortedRevisions.length > 0) {
          setActiveRevision(sortedRevisions[0]);
          // Parse the content
          try {
            const content = JSON.parse(sortedRevisions[0].content);
            setComponents(content);
          } catch (e) {
            console.error('Failed to parse page content:', e);
          }
        }
      }
      
      setPageData(page);
      
      // You could show a restore confirmation message here
    } catch (error) {
      console.error('Failed to restore revision:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-builder-loading">
        <div className="spinner"></div>
        <p>{localization.t('loadingPage') || 'Loading page...'}</p>
      </div>
    );
  }

  return (
    <div className="page-builder">
      <div className="page-builder-header">
        <h2>{pageData?.title || localization.t('untitledPage') || 'Untitled Page'}</h2>
        <div className="page-builder-status">
          {lastSaved && (
            <span className="last-saved">
              {localization.t('lastSaved') || 'Last saved'}: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <span className={`status-badge status-${pageData?.status || 'draft'}`}>
            {pageData?.status === 'published' 
              ? (localization.t('published') || 'Published') 
              : (localization.t('draft') || 'Draft')}
          </span>
        </div>
        {!readOnly && (
          <div className="page-builder-actions">
            <button 
              className="btn-save" 
              onClick={() => handleSave()}
              disabled={isSaving}
            >
              {isSaving 
                ? (localization.t('saving') || 'Saving...') 
                : (localization.t('save') || 'Save')}
            </button>
            <button 
              className="btn-publish" 
              onClick={handlePublish}
              disabled={isSaving}
            >
              {localization.t('publish') || 'Publish'}
            </button>
          </div>
        )}
      </div>
      
      <div className="page-builder-workspace">
        {!readOnly && (
          <div className="page-builder-sidebar">
            <ComponentPalette onDragStart={handleDragStart} />
            
            <div className="revision-history">
              <h3>{localization.t('revisionHistory') || 'Revision History'}</h3>
              <ul className="revision-list">
                {revisions.map(revision => (
                  <li 
                    key={revision.id}
                    className={activeRevision?.id === revision.id ? 'active' : ''}
                    onClick={() => handleRevisionSwitch(revision)}
                  >
                    {localization.t('version') || 'Version'} {revision.version}
                    <span className="revision-date">
                      {new Date(revision.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
              {activeRevision && activeRevision.id !== revisions[0].id && (
                <button 
                  className="btn-restore" 
                  onClick={handleRestoreRevision}
                  disabled={isSaving}
                >
                  {localization.t('restoreThisVersion') || 'Restore This Version'}
                </button>
              )}
            </div>
          </div>
        )}
        
        <div 
          className="page-builder-canvas"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          ref={canvasRef}
        >
          <PreviewPane 
            components={components}
            selectedElement={selectedElement}
            onSelectElement={handleSelectElement}
            onUpdateElement={handleUpdateElement}
            readOnly={readOnly}
          />
        </div>
        
        {!readOnly && selectedElement && (
          <div className="page-builder-edit-panel">
            <EditPanel 
              element={selectedElement}
              onUpdate={(updates) => handleUpdateElement(selectedElement.id, updates)}
              onDelete={() => handleDeleteElement(selectedElement.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
