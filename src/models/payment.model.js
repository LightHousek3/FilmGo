const mongoose = require("mongoose");
const { toJSON, paginate, softDelete } = require("./plugins");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["VNPAY", "MOMO"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      required: true,
      default: "PENDING",
      index: true,
    },

    paymentTime: {
      type: Date,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

<<<<<<< Updated upstream
=======
    // Generic transaction reference
>>>>>>> Stashed changes
    transactionNo: {
      type: String,
      trim: true,
    },
<<<<<<< Updated upstream
=======

    // ── VNPay-specific fields ──────────────────────────────
    // Unique txnRef sent to VNPay (paymentId-based to allow retries)
    vnpTxnRef: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },

    // VNPay's internal transaction number (from IPN / return)
    vnpTransactionNo: {
      type: String,
      trim: true,
    },

    // Bank transaction number
    vnpBankTranNo: {
      type: String,
      trim: true,
    },

    // Bank code used for payment
    vnpBankCode: {
      type: String,
      trim: true,
    },

    // Card type (ATM, VISA, ...)
    vnpCardType: {
      type: String,
      trim: true,
    },

    // VNPay response code ("00" = success)
    vnpResponseCode: {
      type: String,
      trim: true,
    },

    // Payment date returned by VNPay (yyyyMMddHHmmss)
    vnpPayDate: {
      type: String,
      trim: true,
    },
>>>>>>> Stashed changes
  },
  {
    timestamps: true,
  },
);

// ─── Plugins ─────────────────────────────────────
paymentSchema.plugin(toJSON);
paymentSchema.plugin(paginate);
paymentSchema.plugin(softDelete);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
