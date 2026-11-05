'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ReceiptModal from '@/components/ReceiptModal';
import { formatKsh } from '@/data/products';
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiPhone,
  FiPrinter,
  FiRefreshCw,
  FiMapPin,
  FiExternalLink,
} from 'react-icons/fi';

const statusSteps = [
  { key: 'received', label: 'Order Received', desc: 'Verified by Quickmart Branch' },
  { key: 'packing', label: 'Packing at Deli & Butchery', desc: 'Hand-picked & fresh sealed' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider en route to your gate' },
  { key: 'delivered', label: 'Delivered', desc: 'Handed over successfully' },
];

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useOrder();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      addToCart(item, item.quantity);
    });
    addToast(`Re-added ${order.items.length} items to your basket!`, 'success');
  };

  const advanceOrderStatus = (order) => {
    const currentIndex = statusSteps.findIndex((s) => s.key === order.status);
    if (currentIndex < statusSteps.length - 1) {
      const nextStatus = statusSteps[currentIndex + 1].key;
      const nextText = statusSteps[currentIndex + 1].desc;
      updateOrderStatus(order.id, nextStatus, nextText);
      addToast(`Order ${order.id} status updated to: ${statusSteps[currentIndex + 1].label}`, 'info');
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mx-auto">
              📦
            </div>
            <h1 className="text-xl font-black text-gray-900">No Orders Yet</h1>
            <p className="text-xs text-gray-500">
              You haven&apos;t placed any Quickmart grocery orders yet. Fresh produce, milk, unga, and bakery items are waiting for you!
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow"
            >
              Start Grocery Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <nav className="text-xs text-gray-500 mb-1">
              <Link href="/" className="hover:text-[#E31E24]">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-bold">Orders &amp; Tracking</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Live Order Tracking ({orders.length})
            </h1>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-[#E31E24] hover:text-[#c41a1f]"
          >
            + Shop More Items
          </Link>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = statusSteps.findIndex((s) => s.key === order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-gray-900">
                        {order.id}
                      </span>
                      <span className="bg-red-50 text-[#E31E24] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {order.fulfillmentMode || 'Delivery'}
                      </span>
                      {order.payment?.mpesaReceipt && (
                        <span className="bg-[#009639]/10 text-[#009639] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          M-Pesa: {order.payment.mpesaReceipt}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-KE')} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      <strong>{order.branch?.name || 'Quickmart Supermarket'}</strong>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
                    >
                      <FiPrinter className="w-3.5 h-3.5" />
                      <span>Tax Invoice</span>
                    </button>

                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1.5 bg-[#E31E24] hover:bg-[#c41a1f] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                    >
                      <FiRefreshCw className="w-3.5 h-3.5" />
                      <span>Re-order Basket</span>
                    </button>
                  </div>
                </div>

                {/* Live Progress Timeline Stepper */}
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E31E24] animate-pulse" />
                      <h4 className="font-extrabold text-sm text-gray-900">
                        Status:{' '}
                        <span className="text-[#E31E24] capitalize">
                          {statusSteps[currentStepIdx]?.label || order.status}
                        </span>
                      </h4>
                    </div>

                    {order.status !== 'delivered' && (
                      <button
                        onClick={() => advanceOrderStatus(order)}
                        className="text-[11px] font-bold text-[#E31E24] bg-white border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors shadow-sm self-start sm:self-auto"
                      >
                        ⚡ Simulate Next Rider Step
                      </button>
                    )}
                  </div>

                  {/* Steps Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {statusSteps.map((step, idx) => {
                      const isComplete = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step.key} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isComplete
                                  ? 'bg-[#E31E24] text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {isComplete ? '✓' : idx + 1}
                            </div>
                            <div
                              className={`h-1 flex-1 rounded-full ${
                                isComplete ? 'bg-[#E31E24]' : 'bg-gray-200'
                              }`}
                            />
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold leading-tight ${
                                isCurrent ? 'text-[#E31E24]' : isComplete ? 'text-gray-800' : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-[10px] text-gray-500 hidden sm:block">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Rider Info Card (When out for delivery) */}
                  {order.rider && (
                    <div className="bg-white rounded-xl p-4 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 text-[#E31E24] flex items-center justify-center font-bold">
                          🏍️
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Assigned Dispatch Rider: {order.rider.name}</p>
                          <p className="text-gray-500 text-[11px]">{order.rider.vehicle} • Estimated arrival: 15-20 mins</p>
                        </div>
                      </div>
                      <a
                        href={`tel:${order.rider.phone}`}
                        className="inline-flex items-center gap-1.5 text-[#E31E24] font-bold hover:underline self-start sm:self-auto"
                      >
                        <FiPhone className="w-3.5 h-3.5" />
                        <span>Call Rider</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Items & Financial Breakdown */}
                <div className="grid sm:grid-cols-12 gap-6 pt-2">
                  {/* Items */}
                  <div className="sm:col-span-8 space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                      Ordered Products ({order.items.length})
                    </h5>
                    <div className="divide-y divide-gray-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                              />
                            )}
                            <div>
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="text-gray-400 text-[10px]">
                                {item.quantity} x {formatKsh(item.price)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900">
                            {formatKsh(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="sm:col-span-4 bg-gray-50 rounded-2xl p-4 text-xs space-y-2 border border-gray-100 self-start">
                    <h5 className="font-bold uppercase tracking-wider text-gray-600 mb-2">
                      Payment Details
                    </h5>
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
                        <span>Discount:</span>
                        <span>-{formatKsh(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-sm text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total Paid:</span>
                      <span className="text-[#E31E24]">{formatKsh(order.total)}</span>
                    </div>
                    <div className="pt-2 text-[11px] text-gray-500">
                      <span>Payment Status: </span>
                      <strong className="text-[#E31E24]">{order.payment?.status || 'Paid'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tax Invoice Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceiptOrder)}
        onClose={() => setSelectedReceiptOrder(null)}
        order={selectedReceiptOrder}
      />
    </div>
  );
}

