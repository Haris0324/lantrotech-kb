require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Connect to database
connectDB().then(async () => {
  const User = require('./models/User');
  try {
    const adminExists = await User.findOne({ email: 'admin@lantrotech.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@lantrotech.com',
        password: 'lantrotech123@',
        role: 'admin',
        department: 'Administration'
      });
      console.log('Default Admin user created.');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routers
app.set('io', io);

// Socket.io Connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join question room to receive answer updates
  socket.on('joinQuestion', (questionId) => {
    socket.join(`question_${questionId}`);
  });
  
  socket.on('leaveQuestion', (questionId) => {
    socket.leave(`question_${questionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/questions', require('./routes/question.routes'));
app.use('/api/answers', require('./routes/answer.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
