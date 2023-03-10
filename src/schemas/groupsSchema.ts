import mongoose, { Document, model, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  ycode: string;
  address: string;
  domains: string;
  createdAt: number;
  updatedAt: number;
}

const groupsSchema: Schema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true
  },
  ycode: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  domains: {
    type: String,
    required: true,
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


export default model<IGroup>("Groups", groupsSchema);

