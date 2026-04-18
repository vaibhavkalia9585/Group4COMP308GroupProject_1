const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
    type: {
      type: String,
      enum: ['STATUS_UPDATE', 'NEW_ISSUE', 'URGENT_ALERT', 'ASSIGNMENT'],
      default: 'STATUS_UPDATE',
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
