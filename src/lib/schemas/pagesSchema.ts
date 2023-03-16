import mongoose, { Document, model, Schema } from 'mongoose';

export interface PagesDTO  {
  _id: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  name?: string;
  link?: string;
  markdown?: string;
  icon?: string;
  domain?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PagesDBO extends PagesDTO, Document {
  _id: mongoose.Types.ObjectId;
}

const pagesSchema: Schema<PagesDBO> = new Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: { 
    type: String,
    unique: true,
    required: true
  },
  link: {
    type: String,
    unique: true,
    required: true,
  },
  markdown: {
    type: String,
    required: false,
  },
  icon: {
    type: String,
    required: false,
  },
  domain: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

export default model<PagesDBO>("Pages", pagesSchema);