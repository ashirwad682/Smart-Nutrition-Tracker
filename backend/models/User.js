import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number, default: null },
    weight: { type: Number, default: null },
    goal: { type: String, default: 'Maintain weight' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
