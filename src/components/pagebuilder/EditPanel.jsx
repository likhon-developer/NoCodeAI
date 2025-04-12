import React, { useState } from 'react';
import { LocalizationService } from '../../services/LocalizationService';
import './EditPanel.css';

const localization = new LocalizationService();

// Helper function to generate color input fields
const ColorInput = ({ label, value, onChange }) => (
  <div className="property-row">
    <label>{label}</label>
    <div className="color-input-wrapper">
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  </div>
);

// Helper function to generate select input fields
const SelectInput = ({ label, value, options, onChange }) => (
  <div className="property-row">
    <label>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option, idx) => (
        <option key={idx} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default function EditPanel({ element, onUpdate, onDelete }) {
  const [activeTab, setActiveTab] = useState('content');
  
  if (!element) return null;

  const handleTextChange = (value) => {
    onUpdate({ ...element.properties, text: value });
  };

  const handlePropertyChange = (property, value) => {
    const updatedProperties = { ...element.properties, [property]: value };
    onUpdate({ properties: updatedProperties });
  };

  // Different panels based on element type
  const renderContentPanel = () => {
    switch (element.type) {
      case 'heading':
      case 'paragraph':
      case 'button':
        return (
          <div className="property-group">
            <div className="property-row">
              <label>{localization.t('text') || 'Text'}</label>
              <textarea 
                value={element.properties.text || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={4}
              />
            </div>
            
            {element.type === 'heading' && (
              <SelectInput 
                label={localization.t('headingLevel') || 'Heading Level'}
                value={element.properties.level || 'h2'}
                options={[
                  { value: 'h1', label: 'H1' },
                  { value: 'h2', label: 'H2' },
                  { value: 'h3', label: 'H3' },
                  { value: 'h4', label: 'H4' },
                  { value: 'h5', label: 'H5' },
                  { value: 'h6', label: 'H6' }
                ]}
                onChange={(value) => handlePropertyChange('level', value)}
              />
            )}
            
            {element.type === 'button' && (
              <div className="property-row">
                <label>{localization.t('url') || 'URL'}</label>
                <input 
                  type="text" 
                  value={element.properties.url || '#'} 
                  onChange={(e) => handlePropertyChange('url', e.target.value)} 
                />
              </div>
            )}
          </div>
        );
        
      case 'image':
        return (
          <div className="property-group">
            <div className="property-row">
              <label>{localization.t('imageUrl') || 'Image URL'}</label>
              <input 
                type="text" 
                value={element.properties.src || ''} 
                onChange={(e) => handlePropertyChange('src', e.target.value)} 
              />
            </div>
            <div className="property-row">
              <label>{localization.t('altText') || 'Alt Text'}</label>
              <input 
                type="text" 
                value={element.properties.alt || ''} 
                onChange={(e) => handlePropertyChange('alt', e.target.value)} 
              />
            </div>
            <div className="property-row">
              <button className="btn-select-image">
                {localization.t('selectFromMedia') || 'Select from Media Library'}
              </button>
            </div>
          </div>
        );
        
      case 'video':
        return (
          <div className="property-group">
            <div className="property-row">
              <label>{localization.t('videoUrl') || 'Video URL'}</label>
              <input 
                type="text" 
                value={element.properties.src || ''} 
                onChange={(e) => handlePropertyChange('src', e.target.value)} 
              />
            </div>
            <div className="property-row">
              <label>{localization.t('options') || 'Options'}</label>
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={element.properties.controls || false} 
                    onChange={(e) => handlePropertyChange('controls', e.target.checked)} 
                  />
                  {localization.t('showControls') || 'Show Controls'}
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={element.properties.autoplay || false} 
                    onChange={(e) => handlePropertyChange('autoplay', e.target.checked)} 
                  />
                  {localization.t('autoplay') || 'Autoplay'}
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={element.properties.muted || false} 
                    onChange={(e) => handlePropertyChange('muted', e.target.checked)} 
                  />
                  {localization.t('muted') || 'Muted'}
                </label>
              </div>
            </div>
          </div>
        );
        
      case 'form':
      case 'input':
      case 'textarea':
        return (
          <div className="property-group">
            {(element.type === 'input' || element.type === 'textarea') && (
              <>
                <div className="property-row">
                  <label>{localization.t('label') || 'Label'}</label>
                  <input 
                    type="text" 
                    value={element.properties.label || ''} 
                    onChange={(e) => handlePropertyChange('label', e.target.value)} 
                  />
                </div>
                <div className="property-row">
                  <label>{localization.t('placeholder') || 'Placeholder'}</label>
                  <input 
                    type="text" 
                    value={element.properties.placeholder || ''} 
                    onChange={(e) => handlePropertyChange('placeholder', e.target.value)} 
                  />
                </div>
                <div className="property-row">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={element.properties.required || false} 
                      onChange={(e) => handlePropertyChange('required', e.target.checked)} 
                    />
                    {localization.t('required') || 'Required'}
                  </label>
                </div>
              </>
            )}
            
            {element.type === 'input' && (
              <SelectInput 
                label={localization.t('inputType') || 'Input Type'}
                value={element.properties.type || 'text'}
                options={[
                  { value: 'text', label: 'Text' },
                  { value: 'email', label: 'Email' },
                  { value: 'password', label: 'Password' },
                  { value: 'number', label: 'Number' },
                  { value: 'tel', label: 'Telephone' },
                  { value: 'date', label: 'Date' }
                ]}
                onChange={(value) => handlePropertyChange('type', value)}
              />
            )}
            
            {element.type === 'textarea' && (
              <div className="property-row">
                <label>{localization.t('rows') || 'Rows'}</label>
                <input 
                  type="number" 
                  value={element.properties.rows || 4} 
                  onChange={(e) => handlePropertyChange('rows', parseInt(e.target.value))} 
                  min="2"
                  max="20"
                />
              </div>
            )}
            
            {element.type === 'form' && (
              <>
                <div className="property-row">
                  <label>{localization.t('formAction') || 'Form Action URL'}</label>
                  <input 
                    type="text" 
                    value={element.properties.action || ''} 
                    onChange={(e) => handlePropertyChange('action', e.target.value)} 
                  />
                </div>
                <SelectInput 
                  label={localization.t('formMethod') || 'Form Method'}
                  value={element.properties.method || 'post'}
                  options={[
                    { value: 'post', label: 'POST' },
                    { value: 'get', label: 'GET' }
                  ]}
                  onChange={(value) => handlePropertyChange('method', value)}
                />
              </>
            )}
          </div>
        );
        
      // E-commerce components
      case 'productList':
        return (
          <div className="property-group">
            <div className="property-row">
              <label>{localization.t('title') || 'Title'}</label>
              <input 
                type="text" 
                value={element.properties.title || ''} 
                onChange={(e) => handlePropertyChange('title', e.target.value)} 
              />
            </div>
            <div className="property-row">
              <label>{localization.t('columns') || 'Columns'}</label>
              <input 
                type="number" 
                value={element.properties.columns || 3} 
                onChange={(e) => handlePropertyChange('columns', parseInt(e.target.value))} 
                min="1"
                max="6"
              />
            </div>
            <div className="property-row">
              <label>{localization.t('productsPerPage') || 'Products Per Page'}</label>
              <input 
                type="number" 
                value={element.properties.productsPerPage || 9} 
                onChange={(e) => handlePropertyChange('productsPerPage', parseInt(e.target.value))} 
                min="1"
                max="100"
              />
            </div>
            <div className="property-row">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={element.properties.showPagination || false} 
                  onChange={(e) => handlePropertyChange('showPagination', e.target.checked)} 
                />
                {localization.t('showPagination') || 'Show Pagination'}
              </label>
            </div>
            {/* Category selector would go here */}
            <SelectInput 
              label={localization.t('sortBy') || 'Sort By'}
              value={element.properties.sortBy || 'newest'}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'priceAsc', label: 'Price: Low to High' },
                { value: 'priceDesc', label: 'Price: High to Low' },
                { value: 'nameAsc', label: 'Name: A to Z' },
                { value: 'nameDesc', label: 'Name: Z to A' }
              ]}
              onChange={(value) => handlePropertyChange('sortBy', value)}
            />
          </div>
        );
        
      default:
        return <p>{localization.t('noContentOptions') || 'No content options available for this element.'}</p>;
    }
  };

  const renderStylePanel = () => {
    // Common style properties
    const commonStyles = (
      <>
        {/* Width and Height */}
        <div className="property-row">
          <label>{localization.t('width') || 'Width'}</label>
          <input 
            type="text" 
            value={element.properties.width || '100%'} 
            onChange={(e) => handlePropertyChange('width', e.target.value)} 
          />
        </div>
        
        {/* Height - not applicable to all elements */}
        {element.type !== 'paragraph' && element.type !== 'heading' && (
          <div className="property-row">
            <label>{localization.t('height') || 'Height'}</label>
            <input 
              type="text" 
              value={element.properties.height || 'auto'} 
              onChange={(e) => handlePropertyChange('height', e.target.value)} 
            />
          </div>
        )}
        
        {/* Background Color */}
        <ColorInput 
          label={localization.t('backgroundColor') || 'Background Color'}
          value={element.properties.backgroundColor || '#ffffff'} 
          onChange={(value) => handlePropertyChange('backgroundColor', value)} 
        />
        
        {/* Text properties for text-based elements */}
        {(element.type === 'heading' || element.type === 'paragraph' || element.type === 'button') && (
          <>
            {/* Text Color */}
            <ColorInput 
              label={localization.t('textColor') || 'Text Color'}
              value={element.properties.color || '#333333'} 
              onChange={(value) => handlePropertyChange('color', value)} 
            />
            
            {/* Font Size */}
            <div className="property-row">
              <label>{localization.t('fontSize') || 'Font Size'}</label>
              <input 
                type="text" 
                value={element.properties.fontSize || '16px'} 
                onChange={(e) => handlePropertyChange('fontSize', e.target.value)} 
              />
            </div>
            
            {/* Text Align */}
            <SelectInput 
              label={localization.t('textAlign') || 'Text Align'}
              value={element.properties.textAlign || 'left'}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
                { value: 'justify', label: 'Justify' }
              ]}
              onChange={(value) => handlePropertyChange('textAlign', value)}
            />
          </>
        )}
        
        {/* Margin and Padding */}
        <div className="property-row">
          <label>{localization.t('margin') || 'Margin'}</label>
          <input 
            type="text" 
            value={element.properties.margin || '0'} 
            onChange={(e) => handlePropertyChange('margin', e.target.value)} 
          />
        </div>
        
        <div className="property-row">
          <label>{localization.t('padding') || 'Padding'}</label>
          <input 
            type="text" 
            value={element.properties.padding || '0'} 
            onChange={(e) => handlePropertyChange('padding', e.target.value)} 
          />
        </div>
        
        {/* Border options */}
        <div className="property-row">
          <label>{localization.t('borderRadius') || 'Border Radius'}</label>
          <input 
            type="text" 
            value={element.properties.borderRadius || '0'} 
            onChange={(e) => handlePropertyChange('borderRadius', e.target.value)} 
          />
        </div>
        
        <div className="property-row">
          <label>{localization.t('border') || 'Border'}</label>
          <input 
            type="text" 
            value={element.properties.border || 'none'} 
            onChange={(e) => handlePropertyChange('border', e.target.value)} 
          />
        </div>
      </>
    );

    // Return the appropriate styles based on element type
    return (
      <div className="property-group">
        {commonStyles}
        
        {/* Element-specific styles */}
        {element.type === 'button' && (
          <div className="property-row">
            <label>{localization.t('hoverColor') || 'Hover Color'}</label>
            <input 
              type="color" 
              value={element.properties.hoverColor || '#0066b3'} 
              onChange={(e) => handlePropertyChange('hoverColor', e.target.value)} 
            />
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedPanel = () => {
    return (
      <div className="property-group">
        {/* CSS Classes */}
        <div className="property-row">
          <label>{localization.t('cssClasses') || 'CSS Classes'}</label>
          <input 
            type="text" 
            value={element.properties.className || ''} 
            onChange={(e) => handlePropertyChange('className', e.target.value)} 
          />
        </div>
        
        {/* ID */}
        <div className="property-row">
          <label>{localization.t('elementId') || 'Element ID'}</label>
          <input 
            type="text" 
            value={element.properties.id || ''} 
            onChange={(e) => handlePropertyChange('id', e.target.value)} 
          />
        </div>
        
        {/* Visibility */}
        <div className="property-row">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={element.properties.hidden !== true} 
              onChange={(e) => handlePropertyChange('hidden', !e.target.checked)} 
            />
            {localization.t('visible') || 'Visible'}
          </label>
        </div>
        
        {/* Custom CSS */}
        <div className="property-row">
          <label>{localization.t('customCSS') || 'Custom CSS'}</label>
          <textarea 
            value={element.properties.customCSS || ''} 
            onChange={(e) => handlePropertyChange('customCSS', e.target.value)} 
            rows={5}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="edit-panel">
      <div className="edit-panel-header">
        <h3>
          {localization.t('editing') || 'Editing'}: {localization.t(element.type) || element.type}
        </h3>
        <button 
          className="btn-delete" 
          onClick={onDelete}
          aria-label={localization.t('deleteElement') || 'Delete Element'}
        >
          🗑️
        </button>
      </div>
      
      <div className="edit-panel-tabs">
        <button 
          className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          {localization.t('content') || 'Content'}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          {localization.t('style') || 'Style'}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          {localization.t('advanced') || 'Advanced'}
        </button>
      </div>
      
      <div className="edit-panel-content">
        {activeTab === 'content' && renderContentPanel()}
        {activeTab === 'style' && renderStylePanel()}
        {activeTab === 'advanced' && renderAdvancedPanel()}
      </div>
    </div>
  );
}
