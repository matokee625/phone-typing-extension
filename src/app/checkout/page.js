'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useBranch } from '@/context/BranchContext';
import { useOrder } from '@/context/OrderContext';
import { useToast } from '@/context/ToastContext';
import MpesaModal from '@/components/MpesaModal';
import {
  FiTruck,
  FiMapPin,
  FiSmartphone,
  FiCreditCard,
  FiDollarSign,
  FiCheckCircle,
  FiArrowLeft,
  FiAward,
  FiShield,
  FiLock,
} from 'react-icons/fi';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    subtotal,
    deliveryFee,
    total,
    couponDiscount,
    earnedPoints,
    formatKsh,
    clearCart,
  } = useCart();

  const {
    selectedBranch,
    branches,
    changeBranch,
    fulfillmentMode,
    changeFulfillmentMode,
    deliveryAddress,
    setDeliveryAddress,
  } = useBranch();

  const { createOrder, loyaltyPoints } = useOrder();
  const { addToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('mpesa'); // 'mpesa' | 'card' | 'cod'
  const [mpesaPhone, setMpesaPhone] = useState(deliveryAddress.phone || '0712345678');
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loyalty points discount (1 point = KSh 1)
  const availablePoints = loyaltyPoints || 0;
  const maxRedeemablePoints = Math.min(availablePoints, Math.floor(subtotal * 0.3)); // Max 30% basket value
  const pointsDeduction = useLoyaltyPoints ? maxRedeemablePoints : 0;
  const grandTotal = Math.max(0, total - pointsDeduction);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center max-w-md w-full space-y-4">
          <div className="text-5xl">🛒</div>
          <h2 className="text-xl font-bold text-gray-900">Your basket is empty</h2>
          <p className="text-xs text-gray-500">
            Please add fresh grocery items to your basket before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow"
          >
            Go to Quickmart Aisles
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setDeliveryAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrderClick = (e) => {
    e.preventDefault();

    if (!deliveryAddress.fullName || !deliveryAddress.phone) {
      addToast('Please provide your full name and phone number', 'error');
      return;
    }

    if (fulfillmentMode === 'delivery' && !deliveryAddress.street) {
      addToast('Please provide your street or estate address for delivery', 'error');
      return;
    }

    if (paymentMethod === 'mpesa') {
      setIsMpesaModalOpen(true);
    } else {
      finalizeOrder({
        method: paymentMethod,
        status: paymentMethod === 'card' ? 'Paid (Card)' : 'Pending (Pay on Delivery)',
      });
    }
  };

  const finalizeOrder = (paymentDetails) => {
    setIsSubmitting(true);

    const newOrder = createOrder({
      branch: selectedBranch,
      fulfillmentMode,
      deliveryAddress,
      payment: paymentDetails,
      items: cartItems,
      subtotal,
      deliveryFee,
      discount: couponDiscount + pointsDeduction,
      total: grandTotal,
      earnedPoints,
      redeemedPoints: pointsDeduction,
    });

    clearCart();
    addToast(`Order ${newOrder.id} placed successfully!`, 'success');

    setTimeout(() => {
      router.push(`/orders/${newOrder.id}`);
    }, 800);
  };

  const handleMpesaSuccess = (mpesaData) => {
    setIsMpesaModalOpen(false);
    finalizeOrder({
      method: 'mpesa',
      mpesaReceipt: mpesaData.receiptNumber,
      status: 'Paid',
      phone: mpesaData.phone,
    });
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#E31E24]">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-[#E31E24]">
            Basket
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Complete Your Quickmart Order
        </h1>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Checkout Form */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Fulfillment Mode & Branch */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-extrabold text-sm uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-red-100 text-[#E31E24] flex items-center justify-center text-xs">
                  1
                </span>
                <span>Fulfillment &amp; Branch Outlet</span>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => changeFulfillmentMode('delivery')}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    fulfillmentMode === 'delivery'
                      ? 'border-[#E31E24] bg-red-50/50 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${fulfillmentMode === 'delivery' ? 'bg-[#E31E24] text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <FiTruck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                      Express Doorstep Delivery
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Rider dispatched directly from {selectedBranch.name} (45 mins)
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => changeFulfillmentMode('pickup')}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    fulfillmentMode === 'pickup'
                      ? 'border-[#E31E24] bg-red-50/50 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${fulfillmentMode === 'pickup' ? 'bg-[#E31E24] text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                      In-Store Click &amp; Collect
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Free pickup at customer care counter within 20 mins
                    </p>
                  </div>
                </button>
              </div>

              {/* Branch Selector */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Quickmart Store for this order:
                </label>
                <select
                  value={selectedBranch.id}
                  onChange={(e) => changeBranch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city}) — {b.hours} [Till: {b.tillNumber}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Customer & Delivery Details */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-extrabold text-sm uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-red-100 text-[#E31E24] flex items-center justify-center text-xs">
                  2
                </span>
                <span>Contact &amp; Delivery Destination</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. Grace Wanjiku"
                    className="w-full text-xs sm:text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Safaricom Phone Number (for M-Pesa &amp; Rider) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={deliveryAddress.phone}
                    onChange={(e) => {
                      handleInputChange('phone', e.target.value);
                      setMpesaPhone(e.target.value);
                    }}
                    placeholder="0712 345 678"
                    className="w-full text-xs sm:text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                  />
                </div>
              </div>

              {fulfillmentMode === 'delivery' && (
                <div className="space-y-4 pt-2">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Street / Estate / Road *
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        placeholder="e.g. Rose Avenue, Off Argwings Kodhek"
                        className="w-full text-xs sm:text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Apartment / House / Gate No.
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.building}
                        onChange={(e) => handleInputChange('building', e.target.value)}
                        placeholder="e.g. Silver Oak Apartments, Apt 4B"
                        className="w-full text-xs sm:text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Rider Delivery Instructions
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.deliveryNotes}
                      onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                      placeholder="e.g. Ring bell 4B or leave with security at the main gate"
                      className="w-full text-xs sm:text-sm px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-extrabold text-sm uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-red-100 text-[#E31E24] flex items-center justify-center text-xs">
                  3
                </span>
                <span>Select Payment Method</span>
              </div>

              <div className="space-y-3">
                {/* Lipa na M-Pesa Option */}
                <div
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-[#009639] bg-green-50/50 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#009639] text-white flex items-center justify-center font-black text-sm">
                        M
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
                          <span>Lipa na M-Pesa (Till {selectedBranch.tillNumber})</span>
                          <span className="bg-[#009639] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Instant STK push prompt will be sent directly to your phone.
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'mpesa' ? 'border-[#009639] bg-[#009639]' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'mpesa' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {paymentMethod === 'mpesa' && (
                    <div className="mt-4 pt-3 border-t border-green-200 space-y-2">
                      <label className="block text-xs font-bold text-gray-700">
                        Confirm Phone Number for STK Push:
                      </label>
                      <input
                        type="tel"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        className="w-full text-xs sm:text-sm px-4 py-2 bg-white border border-green-300 rounded-xl focus:ring-2 focus:ring-[#009639] focus:outline-none font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* M-Pesa Paybill / Bank Option */}
                <div
                  onClick={() => setPaymentMethod('paybill')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'paybill'
                      ? 'border-[#009639] bg-green-50/50 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xs">
                        PAY
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                          M-Pesa Paybill to Bank (Direct Co-op Transfer)
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Pay directly via Paybill <strong>400200</strong> &bull; Acc: <strong>1115252</strong>
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'paybill' ? 'border-[#009639] bg-[#009639]' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'paybill' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {paymentMethod === 'paybill' && (
                    <div className="mt-4 pt-3 border-t border-green-200 text-xs space-y-2 bg-white p-3 rounded-xl border border-green-200">
                      <p className="font-bold text-gray-800">How to pay with M-Pesa Paybill:</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-600">
                        <li>Go to M-Pesa &rarr; Lipa na M-Pesa &rarr; <strong>Paybill</strong></li>
                        <li>Enter Business No: <strong className="text-gray-900 font-mono">400200</strong></li>
                        <li>Enter Account No: <strong className="text-gray-900 font-mono">1115252</strong></li>
                        <li>Enter Exact Amount: <strong className="text-[#E31E24]">{formatKsh(grandTotal)}</strong></li>
                        <li>Enter PIN and confirm. Paste the M-Pesa reference code below:</li>
                      </ol>
                      <input
                        type="text"
                        placeholder="e.g. QKM9182LA4 or RE83JX..."
                        className="w-full text-xs uppercase px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#009639] focus:outline-none font-mono font-bold mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* Credit/Debit Card Option */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#E31E24] bg-red-50/50 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                        <FiCreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                          Credit or Debit Card (Visa / Mastercard)
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Secured with 3D Secure bank encryption.
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'card' ? 'border-[#E31E24] bg-[#E31E24]' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#E31E24] bg-red-50/50 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                        <FiDollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                          Pay on Delivery (Cash or Mobile M-Pesa to Rider)
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Inspect your fresh groceries first, then pay the rider upon handover.
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-[#E31E24] bg-[#E31E24]' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Points Redemption Option */}
            {availablePoints > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center">
                    <FiAward className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-gray-950">
                      Redeem Quickmart Fresh Points
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      You have <strong>{availablePoints} points</strong> available. Redeem up to{' '}
                      <strong>{formatKsh(maxRedeemablePoints)}</strong> instant discount.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
                    useLoyaltyPoints
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  {useLoyaltyPoints ? 'Applied (-' + formatKsh(maxRedeemablePoints) + ')' : 'Apply Points'}
                </button>
              </div>
            )}
          </div>

          {/* Right: Order Review & Place Order Button */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24 space-y-5">
              <h3 className="font-black text-base text-gray-900">
                Order Review ({cartItems.length} items)
              </h3>

              {/* Mini Item List */}
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 space-y-2 pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs pt-2">
                    <div className="truncate pr-2">
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {item.quantity} x {formatKsh(item.price)}
                      </p>
                    </div>
                    <span className="font-bold text-gray-800 flex-shrink-0">
                      {formatKsh(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Groceries Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatKsh(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery ({selectedBranch.name})</span>
                  <span className={deliveryFee === 0 ? 'text-[#E31E24] font-bold' : 'font-semibold text-gray-900'}>
                    {deliveryFee === 0 ? 'FREE' : formatKsh(deliveryFee)}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#E31E24] font-semibold">
                    <span>Coupon Voucher</span>
                    <span>-{formatKsh(couponDiscount)}</span>
                  </div>
                )}

                {pointsDeduction > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Fresh Points Discount</span>
                    <span>-{formatKsh(pointsDeduction)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total Due</span>
                  <span className="text-[#E31E24]">{formatKsh(grandTotal)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePlaceOrderClick}
                className="w-full flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c41a1f] active:scale-98 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all text-sm"
              >
                <FiLock className="w-4 h-4" />
                <span>
                  {paymentMethod === 'mpesa'
                    ? `Pay ${formatKsh(grandTotal)} with M-Pesa`
                    : `Confirm & Place Order (${formatKsh(grandTotal)})`}
                </span>
              </button>

              <div className="text-center space-y-1">
                <p className="text-[10px] text-gray-400">
                  By confirming, you agree to Quickmart Supermarket Kenyan terms of service.
                </p>
                <p className="text-[10px] text-[#E31E24] font-bold">
                  ⚡ 45-Minute Express Delivery Guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* M-Pesa STK Push Simulation Modal */}
      <MpesaModal
        isOpen={isMpesaModalOpen}
        onClose={() => setIsMpesaModalOpen(false)}
        amount={grandTotal}
        phone={mpesaPhone || deliveryAddress.phone}
        tillNumber={selectedBranch.tillNumber}
        onSuccess={handleMpesaSuccess}
      />
    </div>
  );
}

