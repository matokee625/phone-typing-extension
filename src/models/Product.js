import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    categorySlug: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    discount: { type: String },
    image: { type: String, required: true },
    unit: { type: String, default: 'piece' },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 50 },
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 12 },
    badge: { type: String },
    description: { type: String },
    nutritionalInfo: {
      calories: String,
      fat: String,
      protein: String,
      carbs: String,
    },
    featured: { type: Boolean, default: false },
    isDeal: { type: Boolean, default: false },
    source: { type: String, default: 'Kenya' },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

