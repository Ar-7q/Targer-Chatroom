require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const app = express();

const { dbConnect } = require('./database');
const router = require('./routes');

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
};

// middlewares
app.use(cors(corsOptions));
app.use('/storage', express.static('storage'))

app.use(express.json({ limit: '8mb' }));
app.use(cookieParser()); // ✅ IMPORTANT

// DB connection
dbConnect();

const PORT = process.env.PORT || 5500;

// routes
app.use('/api/v1', router);



app.get('/', (req, res) => {
    res.send("this is Home Page");
});

// server start
app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
});