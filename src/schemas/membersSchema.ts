import mongoose, { Document, model, Schema } from 'mongoose';

export interface IMembers extends Document {
  group: mongoose.Types.ObjectId;
  account: string;
  rights: string;
  createdAt: Date;
  updatedAt: Date;
}

const membersSchema: Schema<IMembers> = new Schema({
  group: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Groups",
    required: true
  },
  account: {
    type: String,
    required: true,
  },
  rights: {
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

export default model<IMembers>("Members", membersSchema);