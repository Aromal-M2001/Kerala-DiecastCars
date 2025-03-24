const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    image: { type: String, required: true }
});

module.exports = mongoose.model('Model', modelSchema);