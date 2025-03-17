const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EvaluateSchema = new Schema({
    star: { type: Number },
    comment: { type: String },
    evaluaterId: { type: Schema.Types.ObjectId, ref: 'User' },
    evaluatedId: { type: Schema.Types.ObjectId, ref: 'User', required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Evaluate', EvaluateSchema);