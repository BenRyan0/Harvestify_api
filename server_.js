const express = require('express');
const { dbConnect } = require('./utils/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');

const io = new Server(http, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Socket-related logic
let allTrader = [];
let allSeller = [];

const addUser = (traderId, socketId, userInfo) => {
  const userExists = allTrader.some((user) => user.traderId === traderId);
  if (!userExists) {
    allTrader.push({ traderId, socketId, userInfo });
  }
};

const addSeller = (sellerId, socketId, userInfo) => {
  const sellerExists = allSeller.some((user) => user.sellerId === sellerId);
  if (!sellerExists) {
    allSeller.push({ sellerId, socketId, userInfo });
  }
};

const findTrader = (traderId) => allTrader.find((user) => user.traderId === traderId);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('add_user', (customerId, userInfo) => {
    addUser(customerId, socket.id, userInfo);
  });

  socket.on('send_seller_message', (msg) => {
    console.log(msg)
    const trader = findTrader(msg.receiverId);
    if (trader) {
      io.to(trader.socketId).emit('seller_message', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    allTrader = allTrader.filter((user) => user.socketId !== socket.id);
    allSeller = allSeller.filter((user) => user.socketId !== socket.id);
  });
});

// Routes
app.use('/api', require('./routes/chatRoutes'));
app.use('/api/home', require('./routes/home/homeRoutes'));
app.use('/api/home', require('./routes/deal/dealRoutes'));
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/dashboard/sellerRoutes'));
app.use('/api', require('./routes/home/traderAuthRoutes'));
app.use('/api', require('./routes/home/cardRoutes'));
app.use('/api', require('./routes/dashboard/categoryRoutes'));
app.use('/api', require('./routes/dashboard/listingRoute'));

app.get('/', (req, res) => res.send('Hello World!'));

// Start the server
const port = process.env.PORT || 5000;
dbConnect();
http.listen(port, () => console.log(`Server is running on port ${port}!`));
