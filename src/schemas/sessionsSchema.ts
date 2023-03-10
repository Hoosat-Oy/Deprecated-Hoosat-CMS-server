import mongoose, { Document, model, Schema } from "mongoose";

export interface ISessions extends Document {
  token: string;
  account: mongoose.Types.ObjectId;
  method: string;
  createdAt: number;
  updatedAt: number;
}

const sessionsSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  method: {
    type: String,
    required: true,
    default: "unknown"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updtedAt: {
    type: Date,
    default: Date.now
  }
});

export default model<ISessions>("Sessions", sessionsSchema);
