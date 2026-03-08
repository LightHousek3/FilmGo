const mongoose = require('mongoose');

const festivalSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    image: {
        type: String
    },
    content: {
        type: String
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model('Festival', festivalSchema);