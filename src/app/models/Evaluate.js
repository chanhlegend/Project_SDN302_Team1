const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EvaluateSchema = new Schema({
    star: { type: Number },
    evaluaterId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Evaluate', EvaluateSchema);