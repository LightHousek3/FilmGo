const mongoose = require("mongoose");
const { toJSON, paginate, softDelete } = require("./plugins");

const ticketPriceSchema = new mongoose.Schema(
  {
    typeSeat: {
      type: String,
      enum: ["STANDARD", "VIP", "SWEETBOX"],
      required: true,
    },

    typeMovie: {
      type: String,
      enum: ["2D", "3D"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    dayType: {
      type: String,
      enum: ["WEEKDAY", "WEEKEND"],
      required: true,
    },

    startTime: {
      type: String, // "18:00"
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    endTime: {
      type: String, // "22:00"
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// apply plugins if needed (e.g. toJSON, paginate etc.)
ticketPriceSchema.plugin(toJSON);
ticketPriceSchema.plugin(paginate);
ticketPriceSchema.plugin(softDelete);

const TicketPrice = mongoose.model("TicketPrice", ticketPriceSchema);

module.exports = TicketPrice;
