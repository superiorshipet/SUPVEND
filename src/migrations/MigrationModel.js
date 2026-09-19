const mongoose = require('mongoose');

// ─── Migration tracking model ──────────────────────────────
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  batch: { type: Number, required: true },
  executedAt: { type: Date, default: Date.now },
});

migrationSchema.index({ batch: 1, executedAt: 1 });

module.exports = mongoose.model('Migration', migrationSchema);
