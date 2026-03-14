const mongoose = require("mongoose");
const { BANNER_TYPE } = require("../constants");

const bannerSchema = new mongoose.Schema(
{
  type: {
    type: String,
    enum: Object.values(BANNER_TYPE),
    required: true
  },

  url: {
    type: String,
    required: true,
    unique: true
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Banner", bannerSchema);