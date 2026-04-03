require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const {dbConnect} = require('./database');
const router = require('./routes');

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

// middlewares
app.use(cors(corsOptions));
app.use(express.json());

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