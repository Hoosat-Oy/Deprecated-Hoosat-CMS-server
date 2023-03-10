import mongoose, { Document, model, Schema } from "mongoose";

export interface ISessions extends Document {
  token: string;
  account: mongoose.Types.ObjectId;
  method: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionsSchema: Schema<ISessions> = new Schema({
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
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default model<ISessions>("Sessions", sessionsSchema);
