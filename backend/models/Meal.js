import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodName: { type: String, required: true, trim: true },
    barcode: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 0.01 },
    servingUnit: { type: String, default: 'g' },
    servingSize: { type: Number, default: 100 },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    fats: { type: Number, required: true },
    carbs: { type: Number, required: true },
    mealType: { type: String, default: 'snack' },
    source: { type: String, default: 'manual' },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Meal', mealSchema);
