const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    totalStock: { type: Number, required: true, default: 216 }
});

module.exports = mongoose.model('Stock', stockSchema);