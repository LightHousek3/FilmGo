const { newsService } = require('../services');
const { asyncHandler, ResponseHandler, pick } = require('../utils');
const News = require('../models/news.model');

class NewsController {

    // Create a news
    async createNews(req, res) {
        try {

            const { title, date, endDate } = req.body;

            const existing = await News.findOne({ title });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "News title already exists"
                });
            }

            if (endDate && new Date(endDate) < new Date(date)) {
                return res.status(400).json({
                    success: false,
                    message: "End date must be after start date"
                });
            }

            const news = new News(req.body);

            res.status(201).json({
                success: true,
                data: await news.save()
            });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // View News List (paginated)
    async getNewsList(req, res) {
        try {
            const filter = pick(req.query, ['category', 'author', 'location']);
            const options = pick(req.query, ['sortBy', 'limit', 'page', 'select', 'populate']);
            const result = await newsService.getNewsList(filter, options);

            return ResponseHandler.paginated(res, {
                message: 'News list fetched successfully',
                data: result.results,
                meta: result.meta,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // View News Detail
    async getNewsDetail(req, res) {
        try {
            const news = await News.findById(req.params.id);

            if (!news) {
                return res.status(404).json({ message: 'News not found' });
            }

            res.json({
                success: true,
                data: news
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Update News
    async updateNews(req, res) {
        try {

            if (req.body.title) {
                const existing = await News.findOne({
                    title: req.body.title,
                    _id: { $ne: req.params.id }
                });

                if (existing) {
                    return res.status(400).json({
                        success: false,
                        message: "News title already exists"
                    });
                }
            }

            const { date, endDate } = req.body;

            if (date && endDate && new Date(endDate) < new Date(date)) {
                return res.status(400).json({
                    success: false,
                    message: "End date must be after start date"
                });
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    // Delete News
    async deleteNews(req, res) {
        try {
            const news = await News.findByIdAndDelete(req.params.id);

            if (!news)
                return res.status(404).json({ message: "News not found" });

            res.json({
                success: true,
                message: "News deleted"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

}

module.exports = new NewsController();