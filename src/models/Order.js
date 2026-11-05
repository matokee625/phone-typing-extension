import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String },
  image: { type: String },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },
    branch: {
      id: { type: String, default: 'kilimani' },
      name: { type: String, default: 'Quickmart Kilimani' },
      phone: { type: String },
    },
    fulfillmentMode: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    deliveryAddress: {
      fullName: String,
      phone: String,
      street: String,
      building: String,
      city: { type: String, default: 'Nairobi' },
      notes: String,
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    earnedPoints: { type: Number, default: 0 },
    payment: {
      method: { type: String, enum: ['mpesa', 'card', 'cash'], default: 'mpesa' },
      status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
      mpesaReceipt: { type: String },
      phone: { type: String },
    },
    status: {
      type: String,
      enum: ['received', 'packing', 'out_for_delivery', 'ready_for_pickup', 'delivered', 'cancelled'],
      default: 'received',
    },
    statusText: { type: String, default: 'Order received and confirmed' },
    estimatedTime: { type: String, default: '30 - 45 mins' },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

