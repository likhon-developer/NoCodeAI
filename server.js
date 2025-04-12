const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const { AIService } = require('./src/services/AIService');

const aiService = new AIService();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoints
app.post('/api/execute', async (req, res) => {
  try {
    const { code, inputs } = req.body;
    const result = await aiService.executeServerless('execute-code', { code, inputs });
    res.json({ status: 'success', result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Real-time collaboration
io.on('connection', (socket) => {
  socket.on('code-update', (data) => {
    socket.broadcast.emit('code-update', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
