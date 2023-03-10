import mongoose from 'mongoose';

const membersSchema = new mongoose.Schema({
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

export default mongoose.model("Members", membersSchema);