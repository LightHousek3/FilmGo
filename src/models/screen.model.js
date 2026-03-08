const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        theater: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Theater",
            required: true
        },

        seatCapacity: {
            type: Number,
            required: true,
            min: [1, "seatCapacity must be greater than 0"]
        },

        status: {
            type: String,
            enum: ["ACTIVE", "MAINTENANCE"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Screen", screenSchema);