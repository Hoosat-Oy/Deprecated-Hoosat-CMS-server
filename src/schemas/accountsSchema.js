import mongoose from "mongoose";

const accountsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  username: {
    type: String,
    required: true
  },
  fullname: {
    type: String
  },
  role: {
    type: String,
    default: "none"
  },
  applications: {
    type: [String]
  },
  active: {
    type: Boolean,
    required: true,
    default: false,
  },
  activationCode: {
    type: String,
    required: false,
  },
  recoveryCode: {
    type: String,
    required: false,
  },
  source: {
    type: String,
    required: false,
  },
  sourceSub: {
    type: String,
    required: false,
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

export default mongoose.model("Accounts", accountsSchema);
