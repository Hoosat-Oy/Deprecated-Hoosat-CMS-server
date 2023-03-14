import mongoose, { Document, model, Schema } from 'mongoose';

export interface PagesDTO  {
  name?: string;
  link?: string;
  markdown?: string;
  createdAt: Date,
  updatedAt: Date,
}

interface PagesDBO extends PagesDTO, Document {
  _id: mongoose.Types.ObjectId;
}

const originsSchema: Schema<PagesDBO> = new Schema({
  name: { 
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true,
  },
  markdown: {
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

export default model<PagesDBO>("Origins", originsSchema);