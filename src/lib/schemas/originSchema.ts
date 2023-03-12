import mongoose, { Document, model, Schema } from 'mongoose';

export interface OriginsDTO  {
  address?: string;
}


interface OriginsDBO extends OriginsDTO, Document {
  _id: mongoose.Types.ObjectId;
}

const originsSchema: Schema<OriginsDBO> = new Schema({
  address: { 
    type: String,
    required: true
  }
});

export default model<OriginsDBO>("Origins", originsSchema);