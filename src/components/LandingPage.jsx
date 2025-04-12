import React, { useState } from 'react';
import { LocalizationService } from '../services/LocalizationService';
import './LandingPage.css';

const localization = new LocalizationService();

export default function LandingPage() {
  const [language, setLanguage] = useState('en');
  
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localization.setLanguage(newLang);
  };

  const features = [
    {
      icon: '🤖',
      title: localization.t('aiUITitle'),
      description: localization.t('aiUIDesc')
    },
    {
      icon: '📱',
      title: localization.t('responsiveTitle'),
      description: localization.t('responsiveDesc')
    },
    {
      icon: '🎨',
      title: localization.t('designTitle'),
      description: localization.t('designDesc')
    },
    {
      icon: '🔍',
      title: localization.t('seoTitle'),
      description: localization.t('seoDesc')
    },
    {
      icon: '🚀',
      title: localization.t('frameworkTitle'),
      description: localization.t('frameworkDesc')
    },
    {
      icon: '📊',
      title: localization.t('analyticsTitle'),
      description: localization.t('analyticsDesc')
    }
  ];

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">NoCode AI</div>
        <nav className="nav-links">
          <a href="#features">{localization.t('features')}</a>
          <a href="#templates">{localization.t('templates')}</a>
          <a href="#usecases">{localization.t('useCases')}</a>
          <a href="#pricing">{localization.t('pricing')}</a>
        </nav>
        <div className="header-actions">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="language-selector"
          >
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
          </select>
          <button className="primary-button">{localization.t('getStarted')}</button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1>{localization.t('heroTitle')}</h1>
          <p>{localization.t('heroSubtitle')}</p>
          <button className="cta-button">{localization.t('tryNow')}</button>
        </div>
        <div className="hero-image">
          <img src="/platform-preview.png" alt="NoCode AI Platform" />
        </div>
      </section>

      <section id="features" className="features-section">
        <h2>{localization.t('featuresSectionTitle')}</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className="templates-section">
        <h2>{localization.t('templatesSectionTitle')}</h2>
        <div className="templates-slider">
          <div className="template-card">
            <div className="template-preview"></div>
            <h3>Next.js App</h3>
            <p>{localization.t('nextjsDesc')}</p>
          </div>
          <div className="template-card">
            <div className="template-preview"></div>
            <h3>React SPA</h3>
            <p>{localization.t('reactDesc')}</p>
          </div>
          <div className="template-card">
            <div className="template-preview"></div>
            <h3>Express API</h3>
            <p>{localization.t('expressDesc')}</p>
          </div>
        </div>
      </section>

      <section id="ai-capabilities" className="ai-section">
        <h2>{localization.t('aiCapabilitiesTitle')}</h2>
        <div className="ai-capabilities">
          <div className="ai-card">
            <h3>{localization.t('chatTitle')}</h3>
            <p>{localization.t('chatDesc')}</p>
            <div className="ai-demo chat-demo"></div>
          </div>
          <div className="ai-card">
            <h3>{localization.t('imageGenTitle')}</h3>
            <p>{localization.t('imageGenDesc')}</p>
            <div className="ai-demo image-demo"></div>
          </div>
          <div className="ai-card">
            <h3>{localization.t('codeGenTitle')}</h3>
            <p>{localization.t('codeGenDesc')}</p>
            <div className="ai-demo code-demo"></div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">NoCode AI</div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>{localization.t('product')}</h4>
              <a href="#">{localization.t('features')}</a>
              <a href="#">{localization.t('pricing')}</a>
              <a href="#">{localization.t('faq')}</a>
            </div>
            <div className="footer-column">
              <h4>{localization.t('resources')}</h4>
              <a href="#">{localization.t('docs')}</a>
              <a href="#">{localization.t('tutorials')}</a>
              <a href="#">{localization.t('blog')}</a>
            </div>
            <div className="footer-column">
              <h4>{localization.t('company')}</h4>
              <a href="#">{localization.t('about')}</a>
              <a href="#">{localization.t('contact')}</a>
              <a href="#">{localization.t('careers')}</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 NoCode AI. {localization.t('allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  );
}
