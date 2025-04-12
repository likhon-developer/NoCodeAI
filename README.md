# NoCode AI Platform

A comprehensive, serverless NoCode AI platform designed to enable users to build, deploy, and manage AI-powered applications with a modern, responsive UI and advanced features.

## 🚀 Features

### AI Integration
- Multi-provider AI service (OpenRouter, Groq, Together AI)
- Image generation service
- Code generation service
- Vector database integration for semantic search
- Real-time AI chat interface

### Page Builder
- Drag-and-drop visual page design
- Component palette with multiple categories
- Real-time editing and preview
- Revision history and versioning
- E-commerce component support

### Visual Workflow Designer
- Pure TypeScript SVG-based designer
- Zero external dependencies
- Supports multiple workflow types
- Light and dark theme support
- JSON-based configuration

### Database Builder
- Complete table management
- Multiple view types (Grid, Gallery, Form, Kanban, Calendar)
- Advanced field types and validation
- Role-based access control
- Real-time collaboration

### Code Sandbox
- Browser-based Node.js runtime
- Real-time code execution
- Interactive terminal
- Web server capabilities
- Project storage and management

### Documentation System
- Rich MDX editor
- Code block support
- Live preview
- Autosave functionality
- Dark/light theme support

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- Vite for fast development and builds
- Modern UI with responsive design
- Light and dark theme support

### Backend
- Serverless architecture (AWS Lambda, Supabase)
- WebContainer for in-browser code execution
- RxDB for offline-first data management
- PouchDB adapter for local storage

### AI Services
- Integration with multiple AI providers
- Image generation capabilities
- Natural language processing
- Code generation and analysis

### Data Storage
- Supabase for cloud storage
- RxDB for local-first experience
- Synchronization capabilities

## 📦 Dependencies

- Vite: Fast build tool and development server
- React: UI library
- RxDB: Reactive database for local-first applications
- @mdxeditor/editor: Rich MDX documentation editor
- @webcontainer/api: Run Node.js in the browser
- pouchdb-adapter-idb: IndexedDB adapter for local data
- Lucide React: Modern icon library
- Socket.io: Real-time communication
- Brain.js: Neural network library

## 🏁 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/likhon-developer/NoCodeAI.git
cd NoCodeAI
```

2. Install dependencies:
```bash
npm install
```
https://github.com/likhon-developer/NoCodeAI.git

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENROUTER_API_KEY=your_openrouter_key
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 🧩 Platform Components

### Page Builder
Create beautiful, responsive web pages with a drag-and-drop interface. Add components, customize their properties, and see changes in real-time.

### Database Builder
Create and manage databases visually. Define tables, fields, and relationships, then create views to display your data in different ways.

### AI Chat
Interact with AI models to generate text, answer questions, or get creative suggestions for your projects.

### Code Sandbox
Write and execute code directly in the browser. Build Node.js applications, create API endpoints, or test code snippets.

### Documentation Editor
Create rich documentation for your projects using Markdown and MDX. Include code blocks, images, tables, and more.

## 📋 Roadmap

- User authentication and authorization
- Plugin marketplace
- Advanced AI model fine-tuning
- Enhanced analytics dashboard
- Mobile application builder
- Custom workflow templates
- AI-powered code suggestions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [OpenRouter](https://openrouter.ai/) for AI model access
- [Supabase](https://supabase.io/) for backend services
- [RxDB](https://rxdb.info/) for local-first data management
- [WebContainer API](https://webcontainers.io/) for in-browser Node.js
