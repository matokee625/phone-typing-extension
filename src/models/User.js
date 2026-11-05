import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // stored for demo auth or hashed
    role: { type: String, enum: ['customer', 'admin', 'manager'], default: 'customer' },
    loyaltyPoints: { type: Number, default: 50 }, // 50 welcome points
    savedAddresses: [
      {
        fullName: String,
        phone: String,
        street: String,
        building: String,
        city: { type: String, default: 'Nairobi' },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);

