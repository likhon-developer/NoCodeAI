// Simple Express server without native dependencies
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Demo endpoint for AI functionality
app.post('/api/ai/generate', (req, res) => {
  const { prompt } = req.body;
  
  // Simulate AI response
  setTimeout(() => {
    res.json({
      result: `Generated response for: "${prompt}"`,
      timestamp: new Date().toISOString()
    });
  }, 500);
});

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`- API endpoints available at /api/*`);
  console.log(`- Static files served from /dist`);
});
