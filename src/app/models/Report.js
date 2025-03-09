const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    evidenceUrl: {type: String}, 
    reason: { type: String, required: true }, 
    details: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' }, 
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
