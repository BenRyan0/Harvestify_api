const express = require("express");
const { dbConnect } = require("./utils/db");
const app = express();
const cors = require("cors");
const http = require('http')
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT;
const socket = require('socket.io');
const { userInfo } = require("os");
const cron = require("node-cron");
const generateHarvestNotifications = require("./utils/generateHarvestNotifications");
const getTraderCancellationRate = require("./utils/getTraderCancellationRate");
const Speakeasy =require("speakeasy")

const session = require("express-session")
const passport = require("passport")

const server = http.createServer(app)
require("./utils/passportConfig")


app.use(
  cors({
    origin: process.env.MODE === 'pro' ? [process.env.client_trader_production_url, process.env.client_admin_production_url,'http://localhost:3000','http://localhost:3001'] : ['http://localhost:3000','http://localhost:3001'],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);


const io =socket(server,{
  cors: {
    origin: process.env.MODE === 'pro' ? [process.env.client_trader_production_url, process.env.client_admin_production_url,'http://localhost:3000','http://localhost:3001'] : ['http://localhost:3000','http://localhost:3001'],
    credentials: true,
  }
})
// const io =socket(server,{
//   cors: {
//     origin: '*',
//     credentials: true,
//   }
// })
dbConnect();


var allCustomer = []
var allSeller = []
const addUser = (customerId, socketId, userInfo) => {
  const checkUser = allCustomer.some(u => u.customerId === customerId)
  if (!checkUser) {
      allCustomer.push({
          customerId,
          socketId,
          userInfo
      })
  }
}
const addSeller = (sellerId, socketId, userInfo) => {
  const checkSeller = allSeller.some(u => u.sellerId === sellerId)
  if (!checkSeller) {
      allSeller.push({
          sellerId,
          socketId,
          userInfo
      })
  }
}


const findSeller = (sellerId) => {
  return allSeller.find(c => c.sellerId === sellerId)
}

const findCustomer = (customerId) => {
  return allCustomer.find(c => c.customerId === customerId)
}
let admin = {}
const remove = (socketId) => {
  allCustomer = allCustomer.filter(c => c.socketId !== socketId)
  allSeller = allSeller.filter(c => c.socketId !== socketId)
}

const removeAdmin = (socketId) => {
  if (admin.socketId === socketId) {
      admin = {}
  }
}


io.on('connection',(socket)=>{
  console.log(`socket server is connected...${socket.id} `)

  socket.on('add_user', (customerId, userInfo) => {
    addUser(customerId, socket.id, userInfo)
    io.emit('activeSeller', allSeller)
    io.emit('activeCustomer', allCustomer)
})
  socket.on('add_seller', (sellerId, userInfo) => {
    addSeller(sellerId, socket.id, userInfo)
    io.emit('activeSeller', allSeller)
    io.emit('activeCustomer', allCustomer)
    io.emit('activeAdmin', { status: true })

  })
  socket.on('send_seller_message', (msg) => {
    const { receiverId } = msg; // The customerId
    if (receiverId) {
      // Send message to the specific room
      io.to(receiverId).emit('seller_message', msg);
      io.emit('seller_message_', msg)
      console.log(`Message sent to customer ${receiverId}:`, msg);
    }
  });
  socket.on('add_admin', (adminInfo) => {
    delete adminInfo.email
    admin = adminInfo
    admin.socketId = socket.id
    io.emit('activeSeller', allSeller)
    console.log(allSeller)
    io.emit('activeAdmin', { status: true })
    
  
  })

  socket.on('send_customer_message', (msg) => {
    console.log(msg)
    const seller = findSeller(msg.receiverId)
    if (seller !== undefined) {
        socket.to(seller.socketId).emit('customer_message', msg)
    }
})

socket.on('send_message_admin_to_seller', msg => {
  const seller = findSeller(msg.receiverId)
  if (seller !== undefined) {
    console.log("_________________________________ >")
    console.log(msg)
    console.log("_________________________________ >")
      socket.to(seller.socketId).emit('received_admin_message', msg)
  }
})

socket.on('send_message_seller_to_admin', msg => {
  if (admin.socketId) {
  
    console.log(msg)
 
      socket.to(admin.socketId).emit('received_seller_message', msg)
  }
})




  socket.on('disconnect', () => {
    console.log('user disconnect')
    remove(socket.id)
    removeAdmin(socket.id)
    io.emit('activeAdmin', { status: false })
    io.emit('activeSeller', allSeller)
    io.emit('activeCustomer', allCustomer)

})


})
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60000 * 60
  }
}));
app.use(passport.initialize())
app.use(passport.session())

// demo only
app.get("/trigger-notifications", async (req, res) => {
  try {
    console.log("Manually triggering harvest notifications...");
    await generateHarvestNotifications();
    res.status(200).json({ message: "Harvest notifications triggered successfully!" });
   
  } catch (error) {
    console.error("Error triggering notifications:", error);
    res.status(500).json({ error: "Failed to trigger notifications" });
  }
});
app.get("/trader-cancellation", async (req, res) => {
  try {
    console.log("Manually triggering Trader Cancellation rate calculation...");
    await getTraderCancellationRate();
    res.status(200).json({ message: "Trader Cancellation rate calculation triggered successfully!" });
  } catch (error) {
    console.error("Error triggering Trader Cancellation rate calculation:", error);

    res.status(500).json({ error: "Failed to trigger Trader Cancellation rate calculation" });

  }
});


app.use('/api/2fa', require('./routes/2fa/2FactorAuthRoutes'));
// Routes
app.use('/api', require('./routes/chatRoutes'));
app.use('/api', require('./routes/dashboard/dashboardIndexRoutes'));

app.use('/api/home', require('./routes/home/homeRoutes'));
app.use('/api', require('./routes/deal/dealRoutes'));


app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/dashboard/sellerRoutes'));
app.use('/api', require('./routes/dashboard/adminRoutes'));
app.use('/api', require('./routes/home/traderAuthRoutes'));
app.use('/api', require('./routes/home/cardRoutes'));
app.use('/api', require('./routes/dashboard/categoryRoutes'));
app.use('/api', require('./routes/dashboard/additionalFeatures'));
app.use('/api', require('./routes/dashboard/voucherRoutes'));
app.use('/api', require('./routes/dashboard/listingRoute'));

app.use('/api', require('./routes/transaction/transactionRoutes'));
app.use('/api', require('./routes/home/transactionTrader'));


app.post('/totp-secret', (request, response, next)=>{
  var secret = Speakeasy.generateSecret({length:20});
response.send({"secret":secret.base32})

})
app.post('/totp-generate', (request, response, next)=>{

response.send({
  "token": Speakeasy.totp({
    secret: request.body.secret,
    encoding : "base32"
  })
})

})

app.get("/", (req, res) => {
  res.send("Hello World!");
});

cron.schedule("59 11 * * *", () => {
  console.log("Running daily harvest notification check...");
  generateHarvestNotifications();
});

cron.schedule("0 0 * * *", () => {
  console.log("Running daily harvest cancellation rate...");
  getTraderCancellationRate();
});






server.listen(port, () => {
  // Log the configuration
  console.log(`Server is running on http://localhost:${port}`);
});
