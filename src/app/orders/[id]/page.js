'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ReceiptModal from '@/components/ReceiptModal';
import { formatKsh } from '@/data/products';
import {
  FiCheckCircle,
  FiPrinter,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiArrowLeft,
  FiShoppingBag,
} from 'react-icons/fi';

const statusSteps = [
  { key: 'received', label: 'Order Confirmed', desc: 'Dispatched to branch kitchen & pack team' },
  { key: 'packing', label: 'Packing at Deli & Butchery', desc: 'Fresh cuts and items packed' },
  { key: 'out_for_delivery', label: 'Out with Rider', desc: 'Heading towards your location' },
  { key: 'delivered', label: 'Delivered', desc: 'Package handed over' },
];

export default function OrderDetailPage({ params }) {
  const { id } = params;
  const { getOrderById, updateOrderStatus } = useOrder();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const order = getOrderById(id);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center max-w-md w-full space-y-4">
          <div className="text-5xl">📦</div>
          <h1 className="text-2xl font-black text-gray-900">Order #{id} Not Found</h1>
          <p className="text-xs text-gray-500">
            This order ID could not be located in your browser session.
          </p>
          <Link
            href="/orders"
            className="inline-block bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31E24] hover:underline"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>All My Orders</span>
          </Link>
          <span className="text-xs font-bold text-gray-500">Order ID: {order.id}</span>
        </div>

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-[#E31E24] via-[#c41a1f] to-[#991115] rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-2">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-6 h-6 text-amber-300 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl font-black">
              Order Confirmed &amp; In Motion!
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Thank you for shopping fresh at <strong>{order.branch?.name || 'Quickmart'}</strong>.
            Your order is being assembled and packed with care.
          </p>
          {order.payment?.mpesaReceipt && (
            <p className="text-xs font-mono font-bold bg-white/20 inline-block px-3 py-1 rounded-lg mt-2">
              Safaricom M-Pesa Ref: {order.payment.mpesaReceipt}
            </p>
          )}
        </div>

        {/* Live Stepper Tracker */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900">
              Delivery Progress Timeline
            </h2>
            <button
              onClick={() => setIsReceiptOpen(true)}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
            >
              <FiPrinter className="w-3.5 h-3.5" />
              <span>Print Tax Invoice</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statusSteps.map((step, idx) => {
              const isDone = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone ? 'bg-[#E31E24] text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div
                      className={`h-1 flex-1 rounded-full ${
                        isDone ? 'bg-[#E31E24]' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                  <p
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-[#E31E24]' : isDone ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-gray-500">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Assigned Rider Banner */}
          {order.rider && (
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏍️</span>
                <div>
                  <p className="font-bold text-gray-900">Dispatch Rider: {order.rider.name}</p>
                  <p className="text-gray-600 text-[11px]">{order.rider.vehicle} • Estimated delivery within 20 mins</p>
                </div>
              </div>
              <a
                href={`tel:${order.rider.phone}`}
                className="inline-flex items-center gap-1.5 bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold px-3.5 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
              >
                <FiPhone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>
            </div>
          )}
        </div>

        {/* Items Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-black text-sm uppercase tracking-wider text-gray-600">
            Order Items ({order.items?.length})
          </h3>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 text-xs">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                    />
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs">
                      {item.quantity} x {formatKsh(item.price)} {item.unit ? `(${item.unit})` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-black text-gray-900 text-sm">
                  {formatKsh(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatKsh(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee:</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : formatKsh(order.deliveryFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#E31E24] font-bold">
                <span>Discount / Promo:</span>
                <span>-{formatKsh(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total Amount:</span>
              <span className="text-[#E31E24]">{formatKsh(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={order}
      />
    </div>
  );
}

