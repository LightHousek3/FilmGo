const Festival = require('../models/festival.model');

// CREATE FESTIVAL
exports.createFestival = async (req, res) => {
    try {

        // CHECK TITLE UNIQUE
        const existingFestival = await Festival.findOne({ title: req.body.title });

        if (existingFestival) {
            return res.status(400).json({
                success: false,
                message: "Festival title already exists"
            });
        }

        const festival = await Festival.create(req.body);

        res.status(201).json({
            success: true,
            data: festival
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL FESTIVALS
exports.getFestivals = async (req, res) => {
    try {

        const festivals = await Festival.find();

        res.json({
            success: true,
            data: festivals
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET FESTIVAL BY ID
exports.getFestivalById = async (req, res) => {
    try {

        const festival = await Festival.findById(req.params.id);

        if (!festival) {
            return res.status(404).json({
                success: false,
                message: "Festival not found"
            });
        }

        res.json({
            success: true,
            data: festival
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE FESTIVAL
exports.updateFestival = async (req, res) => {
    try {

        // CHECK TITLE UNIQUE (if title is updated)
        if (req.body.title) {
            const existingFestival = await Festival.findOne({
                title: req.body.title,
                _id: { $ne: req.params.id }
            });

            if (existingFestival) {
                return res.status(400).json({
                    success: false,
                    message: "Festival title already exists"
                });
            }
        }

        const festival = await Festival.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!festival) {
            return res.status(404).json({
                success: false,
                message: "Festival not found"
            });
        }

        res.json({
            success: true,
            data: festival
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE FESTIVAL
exports.deleteFestival = async (req, res) => {
    try {

        const festival = await Festival.findById(req.params.id);

        if (!festival) {
            return res.status(404).json({
                success: false,
                message: "Festival not found"
            });
        }

        const now = new Date();

        // CHECK FESTIVAL IS RUNNING
        if (festival.startTime <= now && festival.endTime >= now) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete festival that is currently running"
            });
        }

        await Festival.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Festival deleted"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};