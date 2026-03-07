const mongoose = require("mongoose");
const { toJSON, paginate, softDelete } = require("./plugins");

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// ─── Plugins ─────────────────────────────────────────────
theaterSchema.plugin(toJSON);
theaterSchema.plugin(paginate);
theaterSchema.plugin(softDelete);

const Theater = mongoose.model("Theater", theaterSchema);

module.exports = Theater;
