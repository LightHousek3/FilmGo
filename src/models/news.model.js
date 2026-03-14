const mongoose = require('mongoose');
const { toJSON, paginate, softDelete } = require('./plugins');

const newsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        subTitle: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        author: {
            type: String,
            required: true
        },

        publishDate: {
            type: Date,
            default: Date.now
        },

        category: {
            type: String,
            required: true
        },

        content: {
            type: String,
            required: true
        },

        image: {
            url: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: true
            }
        },

        date: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date
        },

        location: {
            type: String,
            required: true
        }

    },
    {
        timestamps: true
    }
);

// Apply plugins
newsSchema.plugin(toJSON);
newsSchema.plugin(paginate);
newsSchema.plugin(softDelete);

module.exports = mongoose.model('News', newsSchema);