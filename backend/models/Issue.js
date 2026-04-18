const mongoose = require('mongoose');

const CATEGORIES = [
  'POTHOLE',
  'STREETLIGHT',
  'FLOODING',
  'SAFETY',
  'GARBAGE',
  'NOISE',
  'GRAFFITI',
  'OTHER',
];

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: CATEGORIES, default: 'OTHER' },
    location: {
      address: { type: String, default: '' },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    imageUrl: { type: String, default: '' },
    status: { type: String, enum: STATUSES, default: 'OPEN' },
    priority: { type: String, enum: PRIORITIES, default: 'MEDIUM' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Optional AI metadata populated by the ai-service
    aiSummary: { type: String, default: '' },
    aiSuggestedCategory: { type: String, default: '' },
    aiSuggestedPriority: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
