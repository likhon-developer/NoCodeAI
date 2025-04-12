import React, { useState, useEffect } from 'react';
import './DatabaseBuilder.css';

const FieldDialog = ({ field, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [required, setRequired] = useState(false);
  const [unique, setUnique] = useState(false);
  const [options, setOptions] = useState({});
  
  // Initialize form with field data if editing
  useEffect(() => {
    if (field) {
      setName(field.name || '');
      setType(field.type || 'text');
      setRequired(field.is_required || false);
      setUnique(field.is_unique || false);
      setOptions(field.options || {});
    }
  }, [field]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const fieldData = {
      name,
      type,
      is_required: required,
      is_unique: unique,
      options,
      is_hidden: false
    };
    
    onSave(fieldData);
  };
  
  const renderTypeSpecificOptions = () => {
    switch (type) {
      case 'select':
        return (
          <div className="form-group">
            <label>Options (one per line)</label>
            <textarea
              value={(options.choices || []).join('\n')}
              onChange={(e) => {
                const choices = e.target.value.split('\n').filter(Boolean);
                setOptions({ ...options, choices });
              }}
              rows={5}
              placeholder="Enter options, one per line"
            />
          </div>
        );
        
      case 'number':
        return (
          <>
            <div className="form-group">
              <label>Min Value</label>
              <input
                type="number"
                value={options.min || ''}
                onChange={(e) => {
                  const min = e.target.value === '' ? undefined : Number(e.target.value);
                  setOptions({ ...options, min });
                }}
                placeholder="Minimum value"
              />
            </div>
            <div className="form-group">
              <label>Max Value</label>
              <input
                type="number"
                value={options.max || ''}
                onChange={(e) => {
                  const max = e.target.value === '' ? undefined : Number(e.target.value);
                  setOptions({ ...options, max });
                }}
                placeholder="Maximum value"
              />
            </div>
            <div className="form-group">
              <label>Format</label>
              <select
                value={options.format || 'integer'}
                onChange={(e) => setOptions({ ...options, format: e.target.value })}
              >
                <option value="integer">Integer</option>
                <option value="decimal">Decimal</option>
                <option value="currency">Currency</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
          </>
        );
        
      case 'text':
        return (
          <div className="form-group">
            <label>Maximum Length</label>
            <input
              type="number"
              min="1"
              value={options.maxLength || ''}
              onChange={(e) => {
                const maxLength = e.target.value === '' ? undefined : Number(e.target.value);
                setOptions({ ...options, maxLength });
              }}
              placeholder="Maximum length"
            />
          </div>
        );
        
      case 'date':
        return (
          <div className="form-group">
            <label>Format</label>
            <select
              value={options.format || 'date'}
              onChange={(e) => setOptions({ ...options, format: e.target.value })}
            >
              <option value="date">Date only</option>
              <option value="datetime">Date and time</option>
              <option value="time">Time only</option>
            </select>
          </div>
        );
        
      case 'lookup':
        return (
          <div className="form-group">
            <p className="info-text">
              Lookup fields will be configured in a separate dialog after the field is created.
            </p>
          </div>
        );
        
      case 'formula':
        return (
          <div className="form-group">
            <label>Formula</label>
            <textarea
              value={options.formula || ''}
              onChange={(e) => setOptions({ ...options, formula: e.target.value })}
              rows={5}
              placeholder="Enter formula"
            />
            <p className="info-text">
              Use field names in curly braces, e.g., {"{Price} * {Quantity}"}
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="field-dialog-overlay">
      <div className="field-dialog">
        <div className="field-dialog-header">
          <h3>{field ? 'Edit Field' : 'Add Field'}</h3>
          <button className="btn-close" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Field Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter field name"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Field Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                // Reset options when type changes
                setOptions({});
              }}
            >
              <option value="text">Single Line Text</option>
              <option value="longtext">Long Text</option>
              <option value="number">Number</option>
              <option value="boolean">Checkbox</option>
              <option value="date">Date</option>
              <option value="select">Single Select</option>
              <option value="multiselect">Multi Select</option>
              <option value="user">User</option>
              <option value="file">Attachment</option>
              <option value="url">URL</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="lookup">Lookup</option>
              <option value="rollup">Rollup</option>
              <option value="formula">Formula</option>
              <option value="currency">Currency</option>
            </select>
          </div>
          
          {renderTypeSpecificOptions()}
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
              Required Field
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={unique}
                onChange={(e) => setUnique(e.target.checked)}
                disabled={type === 'multiselect' || type === 'file'}
              />
              Unique Values
            </label>
          </div>
          
          <div className="form-actions">
            <button type="submit" disabled={!name.trim()}>
              {field ? 'Save Changes' : 'Create Field'}
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FieldDialog;
