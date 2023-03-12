import mongoose, { Document, model, Schema } from 'mongoose';

export interface IArticles extends Document {
  group: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  header: string;
  markdown: string;
  read: number;
  domain: string;
  publish: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const articlesSchema : Schema<IArticles> = new Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
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

export default model<IArticles>("Articles", articlesSchema);