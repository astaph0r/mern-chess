const mongoose = require('mongoose');

const SavedGameSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  gameId: {
    type: String,
    required: true,
  },
  fen: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('SavedGame', SavedGameSchema);
