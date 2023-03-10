import mongoose, { Document, model, Schema } from 'mongoose';

export interface IOrigins extends Document {
  address: string;
}

const originsSchema = new mongoose.Schema({
  address: { 
    type: String,
    required: true
  }
});

export default model<IOrigins>("Origins", originsSchema);