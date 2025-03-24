const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    username: { type: String, required: true },
    selectedModels: [
        {
            id: { type: String, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            color: { type: String, required: true }
        }
    ],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);