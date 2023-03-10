import { Schema, model, Document } from "mongoose";

export interface IAccounts extends Document {
  _id: any;
  email: string;
  password?: string;
  username: string;
  fullname?: string;
  role?: string;
  applications?: string[];
  active: boolean;
  activationCode?: string;
  recoveryCode?: string;
  source?: string;
  sourceSub?: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountsSchema: Schema<IAccounts> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  username: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
  },
  role: {
    type: String,
    default: "none",
  },
  applications: {
    type: [String],
  },
  active: {
    type: Boolean,
    required: true,
    default: false,
  },
  activationCode: {
    type: String,
  },
  recoveryCode: {
    type: String,
  },
  source: {
    type: String,
  },
  sourceSub: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<IAccounts>("Accounts", accountsSchema);

