require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const modelRoutes = require('./routes/modelRoutes');
const orderRoutes = require('./routes/orderRoutes');

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT ;

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));