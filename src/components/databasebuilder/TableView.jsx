import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/DatabaseService';
import './DatabaseBuilder.css';

const TableView = ({
  table,
  view,
  records,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
  onEditField,
  onDeleteField,
  loading
}) => {
  const [fields, setFields] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({});
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [error, setError] = useState(null);
  
  const databaseService = new DatabaseService();
  
  // Load fields for the table
  useEffect(() => {
    if (table) {
      loadFields();
    }
  }, [table]);
  
  const loadFields = async () => {
    try {
      const fieldsData = await databaseService.getFields(table.id);
      setFields(fieldsData);
    } catch (err) {
      console.error('Error loading fields:', err);
      setError('Failed to load fields. Please try again.');
    }
  };
  
  const handleCreateRecord = async () => {
    try {
      await onCreateRecord(newRecord);
      setNewRecord({});
      setIsAddingRecord(false);
    } catch (err) {
      console.error('Error creating record:', err);
      setError('Failed to create record. Please try again.');
    }
  };
  
  const handleUpdateRecord = async () => {
    if (!editingRecord) return;
    
    try {
      const { id, ...recordData } = editingRecord;
      await onUpdateRecord(id, recordData);
      setEditingRecord(null);
    } catch (err) {
      console.error('Error updating record:', err);
      setError('Failed to update record. Please try again.');
    }
  };
  
  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await onDeleteRecord(recordId);
      } catch (err) {
        console.error('Error deleting record:', err);
        setError('Failed to delete record. Please try again.');
      }
    }
  };
  
  const handleDeleteField = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
      try {
        await onDeleteField(fieldId);
        // Refresh fields
        await loadFields();
      } catch (err) {
        console.error('Error deleting field:', err);
        setError('Failed to delete field. Please try again.');
      }
    }
  };
  
  const renderCellValue = (record, field) => {
    const value = record[field.name] || '';
    
    switch (field.type) {
      case 'boolean':
        return value ? '✓' : '✗';
        
      case 'date':
        if (!value) return '';
        const date = new Date(value);
        return field.options?.format === 'datetime' 
          ? date.toLocaleString() 
          : date.toLocaleDateString();
          
      case 'select':
        return value;
        
      case 'multiselect':
        return Array.isArray(value) ? value.join(', ') : value;
        
      case 'file':
        if (!value) return '';
        return Array.isArray(value) 
          ? `${value.length} files` 
          : '1 file';
          
      case 'url':
        if (!value) return '';
        return (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        );
        
      default:
        return value;
    }
  };
  
  const renderCellInput = (record, field, isNewRecord = false) => {
    const value = isNewRecord ? newRecord[field.name] || '' : record[field.name] || '';
    const handleChange = (e) => {
      const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      
      if (isNewRecord) {
        setNewRecord({
          ...newRecord,
          [field.name]: newValue
        });
      } else {
        setEditingRecord({
          ...record,
          [field.name]: newValue
        });
      }
    };
    
    switch (field.type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={handleChange}
          />
        );
        
      case 'longtext':
        return (
          <textarea
            value={value}
            onChange={handleChange}
            rows={3}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={handleChange}
            min={field.options?.min}
            max={field.options?.max}
            step={field.options?.format === 'decimal' ? 0.01 : 1}
          />
        );
        
      case 'date':
        return (
          <input
            type={field.options?.format === 'time' ? 'time' : 'datetime-local'}
            value={value}
            onChange={handleChange}
          />
        );
        
      case 'select':
        return (
          <select value={value} onChange={handleChange}>
            <option value="">-- Select --</option>
            {field.options?.choices?.map((choice, index) => (
              <option key={index} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        );
        
      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
        return (
          <div className="multiselect-input">
            {field.options?.choices?.map((choice, index) => (
              <label key={index} className="multiselect-option">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(choice)}
                  onChange={(e) => {
                    let newValues;
                    if (e.target.checked) {
                      newValues = [...selectedValues, choice];
                    } else {
                      newValues = selectedValues.filter(v => v !== choice);
                    }
                    
                    if (isNewRecord) {
                      setNewRecord({
                        ...newRecord,
                        [field.name]: newValues
                      });
                    } else {
                      setEditingRecord({
                        ...record,
                        [field.name]: newValues
                      });
                    }
                  }}
                />
                {choice}
              </label>
            ))}
          </div>
        );
        
      case 'formula':
      case 'lookup':
      case 'rollup':
        // These fields are calculated and cannot be edited directly
        return (
          <span className="read-only-value">{value}</span>
        );
        
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={handleChange}
            maxLength={field.options?.maxLength}
          />
        );
    }
  };
  
  const renderGridView = () => {
    return (
      <div className="grid-view">
        <table>
          <thead>
            <tr>
              {fields.map(field => (
                <th key={field.id}>
                  <div className="th-content">
                    <span className="field-name">{field.name}</span>
                    <div className="field-actions">
                      <button
                        className="btn-edit-field"
                        onClick={() => onEditField(field)}
                        title="Edit field"
                      >
                        ✎
                      </button>
                      
                      {!field.options?.isPrimaryKey && (
                        <button
                          className="btn-delete-field"
                          onClick={() => handleDeleteField(field.id)}
                          title="Delete field"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAddingRecord && (
              <tr className="new-record-row">
                {fields.map(field => (
                  <td key={field.id}>
                    {renderCellInput(null, field, true)}
                  </td>
                ))}
                <td className="actions-cell">
                  <button
                    className="btn-save"
                    onClick={handleCreateRecord}
                  >
                    Save
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setIsAddingRecord(false);
                      setNewRecord({});
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )}
            
            {loading ? (
              <tr>
                <td colSpan={fields.length + 1} className="loading-cell">
                  Loading records...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 1} className="empty-cell">
                  No records found
                </td>
              </tr>
            ) : (
              records.map(record => (
                <tr key={record.id}>
                  {fields.map(field => (
                    <td key={field.id}>
                      {editingRecord && editingRecord.id === record.id
                        ? renderCellInput(editingRecord, field)
                        : renderCellValue(record, field)}
                    </td>
                  ))}
                  <td className="actions-cell">
                    {editingRecord && editingRecord.id === record.id ? (
                      <>
                        <button
                          className="btn-save"
                          onClick={handleUpdateRecord}
                        >
                          Save
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => setEditingRecord(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => setEditingRecord({ ...record })}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {!isAddingRecord && (
          <button
            className="btn-add-record"
            onClick={() => setIsAddingRecord(true)}
          >
            + Add Record
          </button>
        )}
      </div>
    );
  };
  
  const renderGalleryView = () => {
    // Find the primary image field or use the first field
    const imageField = fields.find(f => f.type === 'file' || f.type === 'url') || fields[0];
    const titleField = fields.find(f => f.name.toLowerCase().includes('title') || f.name.toLowerCase().includes('name')) || fields[0];
    
    return (
      <div className="gallery-view">
        {loading ? (
          <div className="loading-state">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">No records found</div>
        ) : (
          <div className="gallery-grid">
            {records.map(record => (
              <div key={record.id} className="gallery-card">
                <div className="card-header">
                  <h4>{record[titleField?.name] || 'Untitled'}</h4>
                  <div className="card-actions">
                    <button
                      className="btn-edit"
                      onClick={() => setEditingRecord({ ...record })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  {fields.slice(0, 4).map(field => (
                    field.id !== titleField?.id && (
                      <div key={field.id} className="card-field">
                        <span className="field-label">{field.name}:</span>
                        <span className="field-value">
                          {renderCellValue(record, field)}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button
          className="btn-add-record"
          onClick={() => setIsAddingRecord(true)}
        >
          + Add Record
        </button>
        
        {isAddingRecord && (
          <div className="record-form-overlay">
            <div className="record-form">
              <h3>Add New Record</h3>
              
              {fields.map(field => (
                <div key={field.id} className="form-group">
                  <label>{field.name}</label>
                  {renderCellInput(null, field, true)}
                </div>
              ))}
              
              <div className="form-actions">
                <button
                  className="btn-save"
                  onClick={handleCreateRecord}
                >
                  Save Record
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setIsAddingRecord(false);
                    setNewRecord({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {editingRecord && (
          <div className="record-form-overlay">
            <div className="record-form">
              <h3>Edit Record</h3>
              
              {fields.map(field => (
                <div key={field.id} className="form-group">
                  <label>{field.name}</label>
                  {renderCellInput(editingRecord, field)}
                </div>
              ))}
              
              <div className="form-actions">
                <button
                  className="btn-save"
                  onClick={handleUpdateRecord}
                >
                  Save Changes
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setEditingRecord(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderFormView = () => {
    return (
      <div className="form-view">
        <div className="form-builder">
          <h3>Form Builder</h3>
          <p>Drag fields here to create your form layout</p>
          
          <div className="form-container">
            {fields.map(field => (
              <div key={field.id} className="form-field">
                <div className="field-header">
                  <span className="field-name">{field.name}</span>
                  <div className="field-actions">
                    <button onClick={() => onEditField(field)}>Edit</button>
                  </div>
                </div>
                <div className="field-preview">
                  {field.type === 'longtext' ? (
                    <textarea disabled placeholder={`Enter ${field.name}`} />
                  ) : field.type === 'select' ? (
                    <select disabled>
                      <option>Select an option</option>
                    </select>
                  ) : field.type === 'boolean' ? (
                    <input type="checkbox" disabled />
                  ) : (
                    <input type="text" disabled placeholder={`Enter ${field.name}`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderKanbanView = () => {
    // Find status field for columns
    const statusField = fields.find(f => 
      f.type === 'select' && 
      (f.name.toLowerCase().includes('status') || 
       f.name.toLowerCase().includes('stage'))
    );
    
    if (!statusField) {
      return (
        <div className="empty-state">
          <p>Kanban view requires a select field for column grouping.</p>
          <button onClick={() => onEditField(null)}>Add Select Field</button>
        </div>
      );
    }
    
    // Get unique status values
    const statuses = statusField.options?.choices || [];
    
    return (
      <div className="kanban-view">
        <div className="kanban-board">
          {statuses.map(status => {
            const columnRecords = records.filter(r => r[statusField.name] === status);
            
            return (
              <div key={status} className="kanban-column">
                <div className="column-header">
                  <h4>{status}</h4>
                  <span className="count">{columnRecords.length}</span>
                </div>
                
                <div className="column-cards">
                  {columnRecords.map(record => (
                    <div key={record.id} className="kanban-card">
                      <h5>{record[fields[0]?.name] || 'Untitled'}</h5>
                      <div className="card-actions">
                        <button onClick={() => setEditingRecord({ ...record })}>Edit</button>
                        <button onClick={() => handleDeleteRecord(record.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="btn-add"
                  onClick={() => {
                    setNewRecord({ [statusField.name]: status });
                    setIsAddingRecord(true);
                  }}
                >
                  + Add Card
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderCalendarView = () => {
    // Find date field for calendar
    const dateField = fields.find(f => f.type === 'date');
    
    if (!dateField) {
      return (
        <div className="empty-state">
          <p>Calendar view requires a date field.</p>
          <button onClick={() => onEditField(null)}>Add Date Field</button>
        </div>
      );
    }
    
    // Simple placeholder for calendar
    return (
      <div className="calendar-view">
        <div className="calendar-header">
          <button className="btn-prev">Previous</button>
          <h3>April 2025</h3>
          <button className="btn-next">Next</button>
        </div>
        
        <div className="calendar-grid">
          <div className="calendar-day-names">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          
          <div className="calendar-days">
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="calendar-day">
                <div className="day-number">{i + 1}</div>
                <div className="day-events">
                  {records
                    .filter(r => {
                      const date = new Date(r[dateField.name]);
                      return date && date.getDate() === i + 1;
                    })
                    .map(record => (
                      <div 
                        key={record.id} 
                        className="event"
                        onClick={() => setEditingRecord({ ...record })}
                      >
                        {record[fields[0]?.name] || 'Untitled'}
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderViewByType = () => {
    switch (view.type) {
      case 'grid':
        return renderGridView();
      case 'gallery':
        return renderGalleryView();
      case 'form':
        return renderFormView();
      case 'kanban':
        return renderKanbanView();
      case 'calendar':
        return renderCalendarView();
      default:
        return renderGridView();
    }
  };
  
  return (
    <div className="table-view">
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {renderViewByType()}
      
      {/* Field dialog would appear when adding/editing fields */}
    </div>
  );
};

export default TableView;
