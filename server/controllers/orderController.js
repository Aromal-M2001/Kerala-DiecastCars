const Order = require('../models/order');
const Stock = require('../models/stocks');

exports.getOrders = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        let orders;
        if (username === "admin") {
            orders = await Order.find();
        } else {
            orders = await Order.find({ username });
        }

        res.json({ success: true, orders });

    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.submitOrder = async (req, res) => {
    try {
        const { username, selectedModels } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        if (!selectedModels || selectedModels.length === 0) {
            return res.status(400).json({ message: "Selected models are required" });
        }

        // Check if the user has already submitted an order
        const existingOrder = await Order.findOne({ username });
        if (existingOrder) {
            return res.status(400).json({ message: "You have already submitted an order" });
        }

        const totalModelsOrdered = selectedModels.reduce((total, model) => total + model.quantity, 0);

        let stock = await Stock.findOne();
        if (!stock) {
            return res.status(400).json({ message: "Stock data not found" });
        }

        if (stock.totalStock == null || isNaN(stock.totalStock)) {
            console.error("Error: Invalid stock value found in database", stock);
            return res.status(500).json({ message: "Invalid stock value in database" });
        }

        if (stock.totalStock < totalModelsOrdered) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        // Save new order
        const newOrder = new Order({ username, selectedModels });
        await newOrder.save();

        // Update stock count
        stock.totalStock -= totalModelsOrdered;
        await stock.save();

        res.json({ success: true, remainingStock: stock.totalStock });
    } catch (error) {
        console.error("Order submission error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { username, selectedModels } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        if (!selectedModels || selectedModels.length === 0) {
            return res.status(400).json({ message: "Selected models are required" });
        }

        const existingOrder = await Order.findOne({ username });

        if (!existingOrder) {
            return res.status(404).json({ message: "No existing order found" });
        }

        // Calculate stock difference
        const oldTotalQty = existingOrder.selectedModels.reduce(
            (total, model) => total + model.quantity,
            0
        );
        const newTotalQty = selectedModels.reduce(
            (total, model) => total + model.quantity,
            0
        );

        let stock = await Stock.findOne();
        if (!stock) {
            return res.status(400).json({ message: "Stock data not found" });
        }

        const stockChange = newTotalQty - oldTotalQty;
        if (stock.totalStock < stockChange) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        // Update order
        existingOrder.selectedModels = selectedModels;
        await existingOrder.save();

        // Update stock
        stock.totalStock -= stockChange;
        await stock.save();

        res.json({ success: true, remainingStock: stock.totalStock });
    } catch (error) {
        console.error("Order update error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
