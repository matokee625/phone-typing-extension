'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useBranch } from '@/context/BranchContext';
import { useToast } from '@/context/ToastContext';
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiArrowLeft,
  FiTag,
  FiCheck,
  FiTruck,
  FiMapPin,
  FiAward,
} from 'react-icons/fi';

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    activeCoupon,
    applyCoupon,
    removeCoupon,
    totalDiscount,
    couponDiscount,
    total,
    earnedPoints,
    formatKsh,
  } = useCart();

  const { selectedBranch } = useBranch();
  const { addToast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    if (res.success) {
      addToast(res.message, 'success');
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm space-y-5">
            <div className="w-20 h-20 bg-red-50 text-[#E31E24] rounded-3xl flex items-center justify-center text-4xl mx-auto">
              🛒
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              Your Quickmart Basket is Empty
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Looks like you haven&apos;t added any items yet. Start shopping our fresh supermarket aisles for milk, unga, bakery, sukuma, and meat!
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md text-sm"
              >
                <FiShoppingBag className="w-4 h-4" />
                <span>Explore Quickmart Aisles</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <nav className="text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:text-[#E31E24]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-bold">Shopping Basket</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Your Shopping Basket ({cartItems.length} items)
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <FiMapPin className="text-[#E31E24]" />
              <span>Fulfilling from: <strong>{selectedBranch.name}</strong></span>
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('Clear all items from your basket?')) {
                clearCart();
                addToast('Basket cleared', 'info');
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold self-start sm:self-auto"
          >
            Clear Entire Basket
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 group"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.unit} • <span className="capitalize">{item.category?.replace('-', ' ')}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        addToast(`Removed ${item.name} from basket`, 'info');
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity & Item Subtotal */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-semibold text-gray-600">
                      {formatKsh(item.price)} each
                    </span>

                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 text-gray-600 hover:bg-gray-200 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 font-black text-xs text-gray-900 min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-gray-600 hover:bg-gray-200 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-black text-gray-900">
                      {formatKsh(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Back link */}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31E24] hover:text-[#c41a1f]"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping Aisles</span>
              </Link>
            </div>
          </div>

          {/* Order Summary & Checkout Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24 space-y-5">
              <h2 className="text-lg font-black text-gray-900">Order Summary</h2>

              {/* Free Delivery Meter */}
              <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <FiTruck className="w-4 h-4 text-[#E31E24]" />
                    <span>Free Delivery Progress</span>
                  </span>
                  <span className="font-extrabold text-[#E31E24]">
                    {subtotal >= freeDeliveryThreshold ? 'UNLOCKED' : `${Math.round(freeDeliveryPercent)}%`}
                  </span>
                </div>

                <div className="w-full bg-red-200/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#E31E24] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryPercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-gray-600">
                  {remainingForFreeDelivery > 0 ? (
                    <>
                      Add <strong className="text-[#E31E24]">{formatKsh(remainingForFreeDelivery)}</strong> more groceries for <strong>FREE 45-min delivery</strong>!
                    </>
                  ) : (
                    <span className="text-[#E31E24] font-bold">
                      🎉 You qualified for FREE Doorstep Delivery!
                    </span>
                  )}
                </p>
              </div>

              {/* Promo Coupon Form */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <FiTag className="text-amber-500" />
                  <span>Have a Promo Voucher?</span>
                </label>

                {activeCoupon ? (
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs">
                    <div>
                      <p className="font-extrabold text-amber-900">{activeCoupon.code}</p>
                      <p className="text-[10px] text-amber-700">{activeCoupon.label}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                      }}
                      placeholder="e.g. FRESH10 or KARIBU"
                      className="flex-1 uppercase text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E31E24] font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
                <p className="text-[10px] text-gray-400">
                  Try promo codes: <strong>FRESH10</strong> (10% off) or <strong>KARIBU</strong> (KSh 200 off)
                </p>
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2.5 text-xs border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Groceries Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatKsh(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Branch Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-[#E31E24] font-bold' : 'font-semibold text-gray-900'}>
                    {deliveryFee === 0 ? 'FREE' : formatKsh(deliveryFee)}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#E31E24] font-semibold">
                    <span>Voucher Discount</span>
                    <span>-{formatKsh(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-[#E31E24]">{formatKsh(total)}</span>
                </div>

                {/* Fresh Points Earned */}
                <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 p-2 rounded-xl text-[11px] font-semibold justify-center">
                  <FiAward className="w-3.5 h-3.5" />
                  <span>You will earn +{earnedPoints} Fresh Club points</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c41a1f] active:scale-98 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all text-sm text-center"
              >
                <span>Proceed to Checkout</span>
                <span>&rarr;</span>
              </Link>

              <div className="text-center">
                <p className="text-[10px] text-gray-400">
                  🔒 Verified Safaricom Lipa na M-Pesa &amp; Card Secure Checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
