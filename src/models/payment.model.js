const mongoose = require('mongoose');
const { toJSON, paginate, softDelete } = require('./plugins');

const paymentSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
            index: true,
        },

        paymentMethod: {
            type: String,
            enum: ['VNPAY', 'MOMO'],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
            required: true,
            default: 'PENDING',
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

        transactionNo: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

// ─── Plugins ─────────────────────────────────────
paymentSchema.plugin(toJSON);
paymentSchema.plugin(paginate);
paymentSchema.plugin(softDelete);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
