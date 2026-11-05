
'use client';

import { FiPrinter, FiX, FiCheckCircle } from 'react-icons/fi';
import { formatKsh } from '@/data/products';

export default function ReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const branchName = order.branch?.name || 'Quickmart Supermarket';
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const vatAmount = Math.round((order.subtotal * 0.16) / 1.16);

  return (
    <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 my-8">
        {/* Actions Bar */}
        <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            Quickmart Official Tax Invoice
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#E31E24] hover:bg-[#c41a1f] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <FiPrinter className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
              aria-label="Close receipt"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thermal Slip Content */}
        <div className="p-8 font-mono text-xs text-gray-800 space-y-4 bg-white" id="printable-receipt">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-gray-300 pb-4">
            <h2 className="text-xl font-black tracking-tight text-gray-900 font-sans">
              QUICKMART SUPERMARKET
            </h2>
            <p className="text-[11px] font-sans font-semibold text-[#E31E24]">
              Fresh & Easy • Kilimani • Westlands • Nationwide
            </p>
            <p className="text-[10px] text-gray-500">{branchName}</p>
            <p className="text-[10px] text-gray-500">VAT PIN: P051892301A | KRA ETR VERIFIED</p>
            <p className="text-[10px] text-gray-500">Tel: +254 709 123 000 | info@quickmart.co.ke</p>
          </div>

          {/* Meta Details */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-gray-300 pb-3">
            <div className="flex justify-between">
              <span>Order No:</span>
              <strong className="text-gray-900">{order.id}</strong>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{orderDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Channel:</span>
              <span>Online E-Commerce Web Store</span>
            </div>
            <div className="flex justify-between">
              <span>Fulfillment:</span>
              <span className="capitalize font-semibold">{order.fulfillmentMode || 'Delivery'}</span>
            </div>
            {order.payment?.mpesaReceipt && (
              <div className="flex justify-between text-[#009639]">
                <span>M-Pesa Ref:</span>
                <strong className="font-bold">{order.payment.mpesaReceipt}</strong>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-2 border-b border-dashed border-gray-300 pb-3">
            <div className="flex justify-between font-bold text-gray-900 border-b border-gray-200 pb-1">
              <span>ITEM (QTY)</span>
              <span>TOTAL</span>
            </div>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-[11px]">
                <div className="pr-2">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {item.quantity} x {formatKsh(item.price)} {item.unit ? `(${item.unit})` : ''}
                  </p>
                </div>
                <span className="font-semibold">{formatKsh(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-[11px] border-b border-dashed border-gray-300 pb-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatKsh(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : formatKsh(order.deliveryFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#E31E24]">
                <span>Discount / Promo:</span>
                <span>-{formatKsh(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-300">
              <span>TOTAL PAID:</span>
              <span className="text-[#E31E24]">{formatKsh(order.total)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 pt-1">
              <span>Includes 16% VAT:</span>
              <span>{formatKsh(vatAmount)}</span>
            </div>
          </div>

          {/* Fresh Points & Loyalty */}
          <div className="bg-red-50 p-2.5 rounded-lg border border-red-200 text-center space-y-0.5">
            <p className="text-[10px] text-[#E31E24] font-semibold uppercase tracking-wider">
              Quickmart Fresh Club Loyalty
            </p>
            <p className="text-xs font-bold text-gray-900">
              + {order.earnedPoints || Math.floor(order.total / 100)} Fresh Points Earned!
            </p>
          </div>

          {/* Barcode Mockup */}
          <div className="pt-2 text-center space-y-1">
            <div className="flex justify-center items-center gap-[2px] h-10 overflow-hidden px-4">
              {Array.from({ length: 42 }).map((_, i) => (
                <span
                  key={i}
                  className={`inline-block h-full bg-gray-900 ${
                    i % 3 === 0 ? 'w-[3px]' : i % 5 === 0 ? 'w-[1px]' : 'w-[2px]'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] tracking-widest text-gray-500 font-mono">
              *{order.id}-ETR-KRA*
            </p>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-gray-500 pt-2 border-t border-dashed border-gray-300">
            <p>Thank you for shopping at Quickmart!</p>
            <p>Goods once sold may be exchanged within 24 hours with this receipt.</p>
            <p className="font-sans font-bold text-[#E31E24] pt-1">www.quickmart.co.ke</p>
          </div>
        </div>
      </div>
    </div>
  );
}

