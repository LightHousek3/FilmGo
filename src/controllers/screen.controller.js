const { screenService } = require('../services');

class ScreenController {

    // Create a new screen
    async createScreen(req, res) {
        try {
            const saved = await screenService.createScreen(req.body);
            res.status(201).json({
                success: true,
                data: saved
            });
        } catch (error) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    }

    // Get list of all screens
    async getScreenList(req, res) {
        try {
            const screens = await screenService.getScreenList();
            res.json({
                success: true,
                data: screens
            });
        } catch (error) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    }

    // Get details of a specific screen
    async getScreenDetail(req, res) {
        try {
            const screen = await screenService.getScreenById(req.params.id);
            res.json({
                success: true,
                data: screen
            });
        } catch (error) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    }

    // Update a screen's information
    async updateScreen(req, res) {
        try {
            const screen = await screenService.updateScreenById(req.params.id, req.body);
            res.json({
                success: true,
                data: screen
            });
        } catch (error) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    }

    // Delete a screen
    async deleteScreen(req, res) {
        try {
            await screenService.deleteScreenById(req.params.id);
            res.json({
                success: true,
                message: "Screen deleted"
            });
        } catch (error) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    }

}

module.exports = new ScreenController();