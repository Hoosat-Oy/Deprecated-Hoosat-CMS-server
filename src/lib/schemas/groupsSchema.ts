import mongoose, { Document, model, Schema } from 'mongoose';

export interface GroupsDTO {
  _id: mongoose.Types.ObjectId;
  name?: string;
  ycode?: string;
  address?: string;
  domains?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GroupsDBO extends GroupsDTO, Document {
  _id: mongoose.Types.ObjectId;
}


const groupsSchema: Schema<GroupsDBO> = new Schema({
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


export default model<GroupsDBO>("Groups", groupsSchema);

