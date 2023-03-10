import mongoose, { Document, model, Schema } from 'mongoose';

export interface IOrigins extends Document {
  address: string;
}

const originsSchema: Schema<IOrigins> = new Schema({
  address: { 
    type: String,
    required: true
  }
});

export default model<IOrigins>("Origins", originsSchema);