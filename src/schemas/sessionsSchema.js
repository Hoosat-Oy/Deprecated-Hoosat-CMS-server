import mongoose from "mongoose";

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

export default mongoose.model("Sessions", sessionsSchema);
