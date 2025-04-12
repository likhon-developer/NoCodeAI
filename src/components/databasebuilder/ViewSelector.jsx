import React, { useState } from 'react';
import './DatabaseBuilder.css';

const ViewSelector = ({
  views,
  selectedView,
  onSelectView,
  onCreateView,
  onUpdateView,
  onDeleteView
}) => {
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewType, setNewViewType] = useState('grid');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateView = async (e) => {
    e.preventDefault();
    
    if (!newViewName.trim()) return;
    
    try {
      await onCreateView({
        name: newViewName,
        type: newViewType,
        filters: [],
        sorts: [],
        is_locked: false,
      });
      
      // Reset form
      setNewViewName('');
      setNewViewType('grid');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create view:', error);
    }
  };

  const handleDeleteView = async (viewId) => {
    if (window.confirm('Are you sure you want to delete this view?')) {
      try {
        await onDeleteView(viewId);
      } catch (error) {
        console.error('Failed to delete view:', error);
      }
    }
  };

  const handleSortChange = async (field, direction) => {
    if (!selectedView) return;
    
    try {
      const currentSorts = [...(selectedView.sorts || [])];
      const existingIndex = currentSorts.findIndex(s => s.field === field);
      
      if (existingIndex >= 0) {
        if (direction) {
          currentSorts[existingIndex].direction = direction;
        } else {
          // Remove this sort if no direction
          currentSorts.splice(existingIndex, 1);
        }
      } else if (direction) {
        currentSorts.push({ field, direction });
      }
      
      await onUpdateView(selectedView.id, {
        sorts: currentSorts
      });
    } catch (error) {
      console.error('Failed to update sort:', error);
    }
  };

  const getViewIcon = (type) => {
    switch (type) {
      case 'grid':
        return '▦';
      case 'gallery':
        return '🖼️';
      case 'form':
        return '📝';
      case 'kanban':
        return '📋';
      case 'calendar':
        return '📅';
      default:
        return '▦';
    }
  };

  return (
    <div className="view-selector">
      {selectedView && (
        <div className="selected-view" onClick={() => setShowViewMenu(!showViewMenu)}>
          <span className="view-icon">{getViewIcon(selectedView.type)}</span>
          <span className="view-name">{selectedView.name}</span>
          <span className="dropdown-arrow">▼</span>
        </div>
      )}
      
      {showViewMenu && (
        <div className="view-menu">
          <div className="view-menu-header">
            <h4>Views</h4>
            <button 
              className="btn-add-view" 
              onClick={() => {
                setIsCreating(true);
                setShowViewMenu(false);
              }}
            >
              + New View
            </button>
          </div>
          
          <ul className="view-list">
            {views.map(view => (
              <li 
                key={view.id}
                className={selectedView && selectedView.id === view.id ? 'selected' : ''}
              >
                <div 
                  className="view-item" 
                  onClick={() => {
                    onSelectView(view);
                    setShowViewMenu(false);
                  }}
                >
                  <span className="view-icon">{getViewIcon(view.type)}</span>
                  <span className="view-name">{view.name}</span>
                </div>
                
                {views.length > 1 && (
                  <button
                    className="btn-delete-view"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteView(view.id);
                    }}
                  >
                    🗑
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isCreating && (
        <div className="view-create-form-overlay">
          <div className="view-create-form">
            <h4>Create New View</h4>
            
            <form onSubmit={handleCreateView}>
              <div className="form-group">
                <label>View Name</label>
                <input
                  type="text"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="Enter view name"
                  autoFocus
                  required
                />
              </div>
              
              <div className="form-group">
                <label>View Type</label>
                <select
                  value={newViewType}
                  onChange={(e) => setNewViewType(e.target.value)}
                >
                  <option value="grid">Grid</option>
                  <option value="gallery">Gallery</option>
                  <option value="form">Form</option>
                  <option value="kanban">Kanban</option>
                  <option value="calendar">Calendar</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="submit" disabled={!newViewName.trim()}>
                  Create View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewViewName('');
                    setNewViewType('grid');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSelector;
