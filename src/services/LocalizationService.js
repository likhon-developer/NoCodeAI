export class LocalizationService {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = {
      en: {
        // General
        welcome: 'Welcome to NoCode AI',
        chatPlaceholder: 'Ask me anything...',
        send: 'Send',
        codePlaceholder: 'Write your NoCode AI logic here',
        debugInfo: 'Debug Information',
        modelPerformance: 'Model Performance',
        livePreview: 'Live Preview',
        
        // Landing Page
        features: 'Features',
        templates: 'Templates',
        useCases: 'Use Cases',
        pricing: 'Pricing',
        getStarted: 'Get Started',
        tryNow: 'Try Now',
        
        // Hero Section
        heroTitle: 'Build AI-Powered Applications Without Code',
        heroSubtitle: 'Create, customize, and deploy advanced AI applications with our intuitive no-code platform',
        
        // Features Section
        featuresSectionTitle: 'Powerful Features',
        aiUITitle: 'AI-Powered UI Generation',
        aiUIDesc: 'Generate user interfaces with simple text prompts',
        responsiveTitle: 'Responsive Components',
        responsiveDesc: 'All components adapt perfectly to any screen size',
        designTitle: 'Modern Design System',
        designDesc: 'Beautiful, consistent design across all applications',
        seoTitle: 'SEO Optimization',
        seoDesc: 'Built-in tools for search engine optimization',
        frameworkTitle: 'Multiple Framework Support',
        frameworkDesc: 'Support for Next.js, React, and more',
        analyticsTitle: 'Analytics Integration',
        analyticsDesc: 'Track user behavior and application performance',
        
        // Templates Section
        templatesSectionTitle: 'Project Templates',
        nextjsDesc: 'Full-stack applications with server-side rendering',
        reactDesc: 'Client-side single page applications with Vite',
        expressDesc: 'Backend API with database integration',
        
        // AI Capabilities Section
        aiCapabilitiesTitle: 'Advanced AI Features',
        chatTitle: 'Chat Interface',
        chatDesc: 'Real-time AI chat with streaming responses',
        imageGenTitle: 'Image Generation',
        imageGenDesc: 'AI-powered image creation from text prompts',
        codeGenTitle: 'Code Generation',
        codeGenDesc: 'Generate code snippets automatically',
        
        // Footer
        product: 'Product',
        resources: 'Resources',
        company: 'Company',
        faq: 'FAQ',
        docs: 'Documentation',
        tutorials: 'Tutorials',
        blog: 'Blog',
        about: 'About Us',
        contact: 'Contact',
        careers: 'Careers',
        allRightsReserved: 'All Rights Reserved'
      },
      bn: {
        // General
        welcome: 'নো-কোড এআই-তে স্বাগতম',
        chatPlaceholder: 'আমাকে কিছু জিজ্ঞাসা করুন...',
        send: 'পাঠান',
        codePlaceholder: 'আপনার নো-কোড এআই লজিক এখানে লিখুন',
        debugInfo: 'ডিবাগ তথ্য',
        modelPerformance: 'মডেল পারফরম্যান্স',
        livePreview: 'লাইভ প্রিভিউ',
        
        // Landing Page
        features: 'বৈশিষ্ট্য',
        templates: 'টেম্পলেট',
        useCases: 'ব্যবহারের ক্ষেত্র',
        pricing: 'মূল্য',
        getStarted: 'শুরু করুন',
        tryNow: 'এখনই চেষ্টা করুন',
        
        // Hero Section
        heroTitle: 'কোড ছাড়াই এআই-চালিত অ্যাপ্লিকেশন তৈরি করুন',
        heroSubtitle: 'আমাদের সহজবোধ্য নো-কোড প্লাটফর্ম ব্যবহার করে উন্নত এআই অ্যাপ্লিকেশন তৈরি, কাস্টমাইজ এবং ডেপ্লয় করুন',
        
        // Features Section
        featuresSectionTitle: 'শক্তিশালী বৈশিষ্ট্য',
        aiUITitle: 'এআই-চালিত ইউআই জেনারেশন',
        aiUIDesc: 'সাধারণ টেক্সট প্রম্পট দিয়ে ইউজার ইন্টারফেস তৈরি করুন',
        responsiveTitle: 'রেসপন্সিভ কম্পোনেন্ট',
        responsiveDesc: 'সমস্ত কম্পোনেন্ট যেকোনো স্ক্রিন সাইজে নিখুঁতভাবে মানিয়ে নেয়',
        designTitle: 'আধুনিক ডিজাইন সিস্টেম',
        designDesc: 'সমস্ত অ্যাপ্লিকেশনে সুন্দর, সামঞ্জস্যপূর্ণ ডিজাইন',
        seoTitle: 'এসইও অপটিমাইজেশন',
        seoDesc: 'সার্চ ইঞ্জিন অপটিমাইজেশনের জন্য অন্তর্নির্মিত টুল',
        frameworkTitle: 'একাধিক ফ্রেমওয়ার্ক সমর্থন',
        frameworkDesc: 'Next.js, React এবং আরও অনেক কিছুর জন্য সমর্থন',
        analyticsTitle: 'অ্যানালিটিক্স ইন্টিগ্রেশন',
        analyticsDesc: 'ব্যবহারকারীর আচরণ এবং অ্যাপ্লিকেশনের কার্যক্ষমতা ট্র্যাক করুন',
        
        // Templates Section
        templatesSectionTitle: 'প্রজেক্ট টেম্পলেট',
        nextjsDesc: 'সার্ভার-সাইড রেন্ডারিং সহ ফুল-স্ট্যাক অ্যাপ্লিকেশন',
        reactDesc: 'Vite সহ ক্লায়েন্ট-সাইড সিঙ্গেল পেজ অ্যাপ্লিকেশন',
        expressDesc: 'ডাটাবেস ইন্টিগ্রেশন সহ ব্যাকএন্ড API',
        
        // AI Capabilities Section
        aiCapabilitiesTitle: 'উন্নত এআই বৈশিষ্ট্য',
        chatTitle: 'চ্যাট ইন্টারফেস',
        chatDesc: 'স্ট্রিমিং রেসপন্স সহ রিয়েল-টাইম এআই চ্যাট',
        imageGenTitle: 'ইমেজ জেনারেশন',
        imageGenDesc: 'টেক্সট প্রম্পট থেকে এআই-চালিত ইমেজ তৈরি',
        codeGenTitle: 'কোড জেনারেশন',
        codeGenDesc: 'স্বয়ংক্রিয়ভাবে কোড স্নিপেট তৈরি করুন',
        
        // Footer
        product: 'পণ্য',
        resources: 'রিসোর্স',
        company: 'কোম্পানি',
        faq: 'সাধারণ প্রশ্ন',
        docs: 'ডকুমেন্টেশন',
        tutorials: 'টিউটোরিয়াল',
        blog: 'ব্লগ',
        about: 'আমাদের সম্পর্কে',
        contact: 'যোগাযোগ',
        careers: 'ক্যারিয়ার',
        allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত'
      }
    };
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
  }

  t(key) {
    return this.translations[this.currentLanguage]?.[key] || key;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }
}
