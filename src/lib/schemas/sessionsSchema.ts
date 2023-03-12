import mongoose, { Document, model, Schema } from "mongoose";

export interface SessionsDTO {
  _id: mongoose.Types.ObjectId;
  token?: string;
  account?: mongoose.Types.ObjectId;
  method?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SessionsDBO extends SessionsDTO, Document {
  _id: mongoose.Types.ObjectId;
}

const sessionsSchema: Schema<SessionsDBO> = new Schema({
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

export default model<SessionsDBO>("Sessions", sessionsSchema);
