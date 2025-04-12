import React, { useState } from 'react';
import { LocalizationService } from '../../services/LocalizationService';
import './ComponentPalette.css';

const localization = new LocalizationService();

// Component type definitions
const componentTypes = {
  layout: [
    {
      type: 'section',
      name: 'Section',
      icon: '🏢',
      properties: {
        backgroundColor: '#ffffff',
        paddingTop: '20px',
        paddingBottom: '20px',
        paddingLeft: '20px',
        paddingRight: '20px',
        width: '100%',
        height: 'auto',
      },
      content: []
    },
    {
      type: 'container',
      name: 'Container',
      icon: '📦',
      properties: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: 'transparent'
      },
      content: []
    },
    {
      type: 'row',
      name: 'Row',
      icon: '⬅➡',
      properties: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: '20px'
      },
      content: []
    },
    {
      type: 'column',
      name: 'Column',
      icon: '⬆⬇',
      properties: {
        flex: '1',
        padding: '10px',
        minWidth: '200px'
      },
      content: []
    }
  ],
  basic: [
    {
      type: 'heading',
      name: 'Heading',
      icon: 'H',
      properties: {
        text: 'Heading Text',
        level: 'h2',
        textAlign: 'left',
        color: '#333333',
        fontFamily: 'inherit',
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '0 0 20px 0'
      }
    },
    {
      type: 'paragraph',
      name: 'Paragraph',
      icon: '¶',
      properties: {
        text: 'This is a paragraph of text. You can edit this to add your own content.',
        textAlign: 'left',
        color: '#666666',
        fontFamily: 'inherit',
        fontSize: '16px',
        lineHeight: '1.6',
        margin: '0 0 15px 0'
      }
    },
    {
      type: 'image',
      name: 'Image',
      icon: '🖼️',
      properties: {
        src: 'https://via.placeholder.com/400x300',
        alt: 'Image description',
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
        borderRadius: '0px'
      }
    },
    {
      type: 'button',
      name: 'Button',
      icon: '🔘',
      properties: {
        text: 'Click Me',
        url: '#',
        backgroundColor: '#0078d7',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '12px 24px',
        borderRadius: '4px',
        border: 'none',
        textAlign: 'center',
        textDecoration: 'none',
        cursor: 'pointer',
        display: 'inline-block'
      }
    }
  ],
  advanced: [
    {
      type: 'form',
      name: 'Form',
      icon: '📝',
      properties: {
        action: '',
        method: 'post',
        padding: '20px',
        backgroundColor: '#f7f7f7',
        borderRadius: '8px',
        border: '1px solid #ddd'
      },
      content: []
    },
    {
      type: 'input',
      name: 'Input Field',
      icon: '✏️',
      properties: {
        type: 'text',
        label: 'Input Field',
        placeholder: 'Enter text here',
        required: false,
        width: '100%',
        padding: '10px',
        margin: '0 0 15px 0',
        borderRadius: '4px',
        border: '1px solid #ddd'
      }
    },
    {
      type: 'textarea',
      name: 'Text Area',
      icon: '📄',
      properties: {
        label: 'Text Area',
        placeholder: 'Enter text here',
        rows: 4,
        required: false,
        width: '100%',
        padding: '10px',
        margin: '0 0 15px 0',
        borderRadius: '4px',
        border: '1px solid #ddd'
      }
    },
    {
      type: 'video',
      name: 'Video',
      icon: '🎬',
      properties: {
        src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        width: '100%',
        height: '315px',
        controls: true,
        autoplay: false,
        muted: false
      }
    }
  ],
  ecommerce: [
    {
      type: 'productList',
      name: 'Product List',
      icon: '🛒',
      properties: {
        title: 'Our Products',
        columns: 3,
        productsPerPage: 9,
        showPagination: true,
        categoryId: null,
        sortBy: 'newest'
      }
    },
    {
      type: 'productDetail',
      name: 'Product Detail',
      icon: '🔍',
      properties: {
        productId: null,
        showGallery: true,
        showPrice: true,
        showDescription: true,
        showAttributes: true,
        showVariants: true,
        showAddToCart: true,
        showRelated: true
      }
    },
    {
      type: 'cart',
      name: 'Shopping Cart',
      icon: '🛍️',
      properties: {
        showThumbnails: true,
        showQuantity: true,
        showPrices: true,
        showTotal: true,
        showCheckoutButton: true
      }
    },
    {
      type: 'checkout',
      name: 'Checkout',
      icon: '💰',
      properties: {
        steps: ['cart', 'delivery', 'payment', 'confirmation'],
        showOrderSummary: true,
        collectShippingAddress: true,
        collectBillingAddress: true,
        paymentMethods: ['credit_card', 'paypal']
      }
    }
  ]
};

export default function ComponentPalette({ onDragStart }) {
  const [activeCategory, setActiveCategory] = useState('layout');

  const handleDragStart = (e, component) => {
    if (onDragStart) {
      onDragStart(e, component);
    }
  };

  return (
    <div className="component-palette">
      <h3>{localization.t('components') || 'Components'}</h3>
      
      <div className="component-categories">
        <button 
          className={`category-btn ${activeCategory === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveCategory('layout')}
        >
          {localization.t('layout') || 'Layout'}
        </button>
        <button 
          className={`category-btn ${activeCategory === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveCategory('basic')}
        >
          {localization.t('basic') || 'Basic'}
        </button>
        <button 
          className={`category-btn ${activeCategory === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveCategory('advanced')}
        >
          {localization.t('advanced') || 'Advanced'}
        </button>
        <button 
          className={`category-btn ${activeCategory === 'ecommerce' ? 'active' : ''}`}
          onClick={() => setActiveCategory('ecommerce')}
        >
          {localization.t('ecommerce') || 'E-commerce'}
        </button>
      </div>
      
      <div className="component-list">
        {componentTypes[activeCategory].map((component, index) => (
          <div 
            key={index}
            className="component-item"
            draggable
            onDragStart={(e) => handleDragStart(e, component)}
          >
            <div className="component-icon">{component.icon}</div>
            <div className="component-name">
              {localization.t(component.type) || component.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
