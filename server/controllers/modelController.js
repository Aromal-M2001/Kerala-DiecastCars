const Model = require('../models/models');
const Stock = require('../models/stocks');

exports.getModels = async (req, res) => {
    try {
        const models = await Model.find();
        const stock = await Stock.findOne();
        res.json({ models, totalStock: stock ? stock.totalStock : 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};