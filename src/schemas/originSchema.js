import mongoose from 'mongoose';

const originsSchema = new mongoose.Schema({
  address: { 
    type: String,
    required: true
  }
});

export default mongoose.model("Origins", originsSchema);