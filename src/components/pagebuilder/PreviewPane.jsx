import React, { useRef, useEffect } from 'react';
import { LocalizationService } from '../../services/LocalizationService';
import './PreviewPane.css';

const localization = new LocalizationService();

export default function PreviewPane({ 
  components, 
  selectedElement, 
  onSelectElement, 
  onUpdateElement,
  readOnly
}) {
  const previewRef = useRef(null);
  
  // Keep track of drag and resize state
  const dragState = useRef({
    isDragging: false,
    element: null,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0
  });
  
  const resizeState = useRef({
    isResizing: false,
    element: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    direction: ''
  });
  
  // Initialize event listeners for drag and resize
  useEffect(() => {
    if (readOnly) return;
    
    const handleMouseMove = (e) => {
      // Handle dragging
      if (dragState.current.isDragging && dragState.current.element) {
        const dx = e.clientX - dragState.current.startX;
        const dy = e.clientY - dragState.current.startY;
        
        const newX = dragState.current.startLeft + dx;
        const newY = dragState.current.startTop + dy;
        
        // Update element position
        const elementId = dragState.current.element.id;
        const component = components.find(comp => comp.id === elementId);
        
        if (component) {
          onUpdateElement(elementId, {
            position: {
              ...component.position,
              x: newX,
              y: newY
            }
          });
        }
      }
      
      // Handle resizing
      if (resizeState.current.isResizing && resizeState.current.element) {
        const dx = e.clientX - resizeState.current.startX;
        const dy = e.clientY - resizeState.current.startY;
        
        const direction = resizeState.current.direction;
        let newWidth = resizeState.current.startWidth;
        let newHeight = resizeState.current.startHeight;
        
        // Calculate new dimensions based on resize direction
        if (direction.includes('e')) { // East / Right
          newWidth = Math.max(50, resizeState.current.startWidth + dx);
        } else if (direction.includes('w')) { // West / Left
          newWidth = Math.max(50, resizeState.current.startWidth - dx);
        }
        
        if (direction.includes('s')) { // South / Bottom
          newHeight = Math.max(30, resizeState.current.startHeight + dy);
        } else if (direction.includes('n')) { // North / Top
          newHeight = Math.max(30, resizeState.current.startHeight - dy);
        }
        
        // Update element dimensions
        const elementId = resizeState.current.element.id;
        const component = components.find(comp => comp.id === elementId);
        
        if (component) {
          onUpdateElement(elementId, {
            properties: {
              ...component.properties,
              width: `${newWidth}px`,
              height: `${newHeight}px`
            }
          });
        }
      }
    };
    
    const handleMouseUp = () => {
      dragState.current.isDragging = false;
      resizeState.current.isResizing = false;
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [components, onUpdateElement, readOnly]);
  
  // Handle element click for selection
  const handleElementClick = (e, component) => {
    e.stopPropagation();
    if (onSelectElement) {
      onSelectElement(component);
    }
  };
  
  // Handle element drag start
  const handleDragStart = (e, component) => {
    if (readOnly) return;
    e.stopPropagation();
    
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    
    dragState.current = {
      isDragging: true,
      element,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: component.position.x,
      startTop: component.position.y
    };
  };
  
  // Handle element resize start
  const handleResizeStart = (e, component, direction) => {
    if (readOnly) return;
    e.stopPropagation();
    
    const element = e.currentTarget.parentNode;
    
    resizeState.current = {
      isResizing: true,
      element,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: parseInt(component.properties.width) || 100,
      startHeight: parseInt(component.properties.height) || 100,
      direction
    };
  };
  
  // Render a component based on its type
  const renderComponent = (component) => {
    // Check if component exists
    if (!component) return null;
    
    const isSelected = selectedElement && selectedElement.id === component.id;
    
    // Create style object from properties
    const style = {
      position: 'absolute',
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
      zIndex: isSelected ? 10 : 1,
      ...component.properties
    };
    
    // Element wrapper with event handlers
    const elementWrapper = (content) => (
      <div
        id={component.id}
        className={`preview-element ${component.type}-element ${isSelected ? 'selected' : ''}`}
        style={style}
        onClick={(e) => handleElementClick(e, component)}
        onMouseDown={(e) => handleDragStart(e, component)}
        key={component.id}
      >
        {content}
        
        {isSelected && !readOnly && (
          <div className="resize-handles">
            <div className="resize-handle n" onMouseDown={(e) => handleResizeStart(e, component, 'n')}></div>
            <div className="resize-handle e" onMouseDown={(e) => handleResizeStart(e, component, 'e')}></div>
            <div className="resize-handle s" onMouseDown={(e) => handleResizeStart(e, component, 's')}></div>
            <div className="resize-handle w" onMouseDown={(e) => handleResizeStart(e, component, 'w')}></div>
            <div className="resize-handle ne" onMouseDown={(e) => handleResizeStart(e, component, 'ne')}></div>
            <div className="resize-handle se" onMouseDown={(e) => handleResizeStart(e, component, 'se')}></div>
            <div className="resize-handle sw" onMouseDown={(e) => handleResizeStart(e, component, 'sw')}></div>
            <div className="resize-handle nw" onMouseDown={(e) => handleResizeStart(e, component, 'nw')}></div>
          </div>
        )}
      </div>
    );
    
    // Render each component type
    switch (component.type) {
      case 'heading':
        const HeadingTag = component.properties.level || 'h2';
        return elementWrapper(
          <HeadingTag style={component.properties}>{component.properties.text || 'Heading'}</HeadingTag>
        );
        
      case 'paragraph':
        return elementWrapper(
          <p style={component.properties}>{component.properties.text || 'Paragraph text'}</p>
        );
        
      case 'image':
        return elementWrapper(
          <img 
            src={component.properties.src || 'https://via.placeholder.com/400x300'} 
            alt={component.properties.alt || 'Image'} 
            style={component.properties}
          />
        );
        
      case 'button':
        return elementWrapper(
          <button style={component.properties}>
            {component.properties.text || 'Button'}
          </button>
        );
        
      case 'section':
        return elementWrapper(
          <section style={component.properties}>
            {component.content && component.content.map(child => renderComponent(child))}
          </section>
        );
        
      case 'container':
        return elementWrapper(
          <div style={component.properties}>
            {component.content && component.content.map(child => renderComponent(child))}
          </div>
        );
        
      case 'row':
        return elementWrapper(
          <div style={component.properties}>
            {component.content && component.content.map(child => renderComponent(child))}
          </div>
        );
        
      case 'column':
        return elementWrapper(
          <div style={component.properties}>
            {component.content && component.content.map(child => renderComponent(child))}
          </div>
        );
        
      case 'form':
        return elementWrapper(
          <form style={component.properties} action={component.properties.action} method={component.properties.method}>
            {component.content && component.content.map(child => renderComponent(child))}
            <button type="submit">{localization.t('submit') || 'Submit'}</button>
          </form>
        );
        
      case 'input':
        return elementWrapper(
          <div className="form-group">
            {component.properties.label && (
              <label>{component.properties.label}</label>
            )}
            <input 
              type={component.properties.type || 'text'} 
              placeholder={component.properties.placeholder || ''} 
              required={component.properties.required || false}
              style={component.properties}
            />
          </div>
        );
        
      case 'textarea':
        return elementWrapper(
          <div className="form-group">
            {component.properties.label && (
              <label>{component.properties.label}</label>
            )}
            <textarea 
              placeholder={component.properties.placeholder || ''} 
              rows={component.properties.rows || 4} 
              required={component.properties.required || false}
              style={component.properties}
            ></textarea>
          </div>
        );
        
      case 'video':
        return elementWrapper(
          <div className="video-wrapper" style={component.properties}>
            <iframe 
              src={component.properties.src || 'https://www.youtube.com/embed/dQw4w9WgXcQ'} 
              width={component.properties.width || '100%'}
              height={component.properties.height || '315'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
        
      // E-commerce components
      case 'productList':
        return elementWrapper(
          <div className="product-list" style={component.properties}>
            <h2>{component.properties.title || 'Products'}</h2>
            <div className="product-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${component.properties.columns || 3}, 1fr)`,
              gap: '20px'
            }}>
              {/* Sample products for preview */}
              {Array.from({ length: 6 }, (_, i) => (
                <div className="product-card" key={i}>
                  <div className="product-image" style={{ height: '200px', backgroundColor: '#f0f0f0' }}></div>
                  <h3>Product {i + 1}</h3>
                  <p>$99.99</p>
                  <button>Add to Cart</button>
                </div>
              ))}
            </div>
            {component.properties.showPagination && (
              <div className="pagination">
                <button>&laquo; Previous</button>
                <span>Page 1 of 3</span>
                <button>Next &raquo;</button>
              </div>
            )}
          </div>
        );
        
      case 'productDetail':
        return elementWrapper(
          <div className="product-detail" style={component.properties}>
            <div className="product-layout" style={{ display: 'flex', gap: '30px' }}>
              {component.properties.showGallery && (
                <div className="product-gallery" style={{ flex: '1', maxWidth: '500px' }}>
                  <div className="main-image" style={{ height: '400px', backgroundColor: '#f0f0f0' }}></div>
                  <div className="thumbnail-row" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i} className="thumbnail" style={{ height: '80px', width: '80px', backgroundColor: '#e0e0e0' }}></div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="product-info" style={{ flex: '1' }}>
                <h1>Sample Product</h1>
                
                {component.properties.showPrice && (
                  <div className="product-price">
                    <p className="price">$99.99</p>
                    <p className="old-price"><strike>$129.99</strike></p>
                  </div>
                )}
                
                {component.properties.showDescription && (
                  <div className="product-description">
                    <p>This is a sample product description. This would typically include details about the product, its features, benefits, and other relevant information to help customers make purchasing decisions.</p>
                  </div>
                )}
                
                {component.properties.showVariants && (
                  <div className="product-variants">
                    <div className="variant-group">
                      <label>Size:</label>
                      <div className="variant-options">
                        <button className="variant-btn">Small</button>
                        <button className="variant-btn active">Medium</button>
                        <button className="variant-btn">Large</button>
                      </div>
                    </div>
                    
                    <div className="variant-group">
                      <label>Color:</label>
                      <div className="variant-options">
                        <button className="variant-btn color-btn" style={{ backgroundColor: 'red' }}></button>
                        <button className="variant-btn color-btn active" style={{ backgroundColor: 'blue' }}></button>
                        <button className="variant-btn color-btn" style={{ backgroundColor: 'green' }}></button>
                      </div>
                    </div>
                  </div>
                )}
                
                {component.properties.showAddToCart && (
                  <div className="add-to-cart">
                    <div className="quantity">
                      <label>Quantity:</label>
                      <input type="number" min="1" value="1" readOnly />
                    </div>
                    <button className="btn-add-to-cart">Add to Cart</button>
                  </div>
                )}
              </div>
            </div>
            
            {component.properties.showRelated && (
              <div className="related-products">
                <h3>Related Products</h3>
                <div className="related-grid" style={{ display: 'flex', gap: '20px' }}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <div className="product-card" key={i} style={{ flex: '1' }}>
                      <div className="product-image" style={{ height: '150px', backgroundColor: '#f0f0f0' }}></div>
                      <h4>Related Product {i + 1}</h4>
                      <p>$79.99</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return elementWrapper(
          <div>Unknown element type: {component.type}</div>
        );
    }
  };
  
  // Handle canvas click to deselect elements
  const handleCanvasClick = (e) => {
    if (e.target === previewRef.current && onSelectElement) {
      onSelectElement(null);
    }
  };

  return (
    <div 
      className="preview-pane"
      ref={previewRef}
      onClick={handleCanvasClick}
    >
      {components.map(component => renderComponent(component))}
      
      {components.length === 0 && (
        <div className="empty-canvas-message">
          {readOnly ? (
            localization.t('emptyPageMessage') || 'This page is empty.'
          ) : (
            localization.t('dragDropMessage') || 'Drag and drop components here to build your page.'
          )}
        </div>
      )}
    </div>
  );
}
