import mongoose, { Document, model, Schema } from 'mongoose';

export interface MembersDTO {
  _id: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;
  account?: string;
  rights?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MembersDBO extends MembersDTO, Document {
  _id: mongoose.Types.ObjectId;
}

const membersSchema: Schema<MembersDBO> = new Schema({
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

export default model<MembersDBO>("Members", membersSchema);