import mongoose from 'mongoose';

const articlesSchema = new mongoose.Schema({
  authorId: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  header: {
    type: String,
    required: true,
  },
  markdown: {
    type: String,
    required: true,
  },
  read: {
    type: Number,
    default: 0
  },
  domain: {
    type: String,
  },
  publish: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Articles", articlesSchema);