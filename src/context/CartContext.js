'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatKsh } from '@/data/products';

const CartContext = createContext();

const CART_STORAGE_KEY = 'quickmart_cart_v2';
const COUPON_STORAGE_KEY = 'quickmart_active_coupon';

export const VALID_COUPONS = {
  FRESH10: { code: 'FRESH10', discountType: 'percent', value: 10, minOrder: 1000, label: '10% Off Fresh Groceries' },
  QUICKMART500: { code: 'QUICKMART500', discountType: 'fixed', value: 500, minOrder: 2500, label: 'KSh 500 Off Supermarket Basket' },
  KARIBU: { code: 'KARIBU', discountType: 'fixed', value: 200, minOrder: 800, label: 'KSh 200 Karibu Welcome Voucher' },
};

export const FREE_DELIVERY_THRESHOLD = 3000;
export const STANDARD_DELIVERY_FEE = 150;

function loadFromStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Fail silently
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [appliedPoints, setAppliedPoints] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setCartItems(loadFromStorage(CART_STORAGE_KEY, []));
    setActiveCoupon(loadFromStorage(COUPON_STORAGE_KEY, null));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveToStorage(CART_STORAGE_KEY, cartItems);
    }
  }, [cartItems, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveToStorage(COUPON_STORAGE_KEY, activeCoupon);
    }
  }, [activeCoupon, isHydrated]);

  const addToCart = useCallback((product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => String(item.id) === String(product.id));
      if (existing) {
        return prev.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      setCartItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(productId) ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setActiveCoupon(null);
    setAppliedPoints(0);
  }, []);

  const getSubtotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const applyCoupon = useCallback((code) => {
    const upper = (code || '').trim().toUpperCase();
    const coupon = VALID_COUPONS[upper];
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code. Try FRESH10 or KARIBU' };
    }
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (subtotal < coupon.minOrder) {
      return {
        success: false,
        message: `This coupon requires a minimum basket of ${formatKsh(coupon.minOrder)}`,
      };
    }
    setActiveCoupon(coupon);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  }, [cartItems]);

  const removeCoupon = useCallback(() => {
    setActiveCoupon(null);
  }, []);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : STANDARD_DELIVERY_FEE;

  // Coupon discount
  let couponDiscount = 0;
  if (activeCoupon) {
    if (activeCoupon.discountType === 'percent') {
      couponDiscount = Math.round((subtotal * activeCoupon.value) / 100);
    } else if (activeCoupon.discountType === 'fixed') {
      couponDiscount = Math.min(activeCoupon.value, subtotal);
    }
  }

  // Points discount (1 point = KSh 1)
  const pointsDiscount = Math.min(appliedPoints, Math.max(0, subtotal - couponDiscount));
  const totalDiscount = couponDiscount + pointsDiscount;
  const finalTotal = Math.max(0, subtotal + deliveryFee - totalDiscount);
  const earnedPoints = Math.floor(finalTotal / 100);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        getCartTotal: getSubtotal,
        getCartCount,
        deliveryFee,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        activeCoupon,
        applyCoupon,
        removeCoupon,
        couponDiscount,
        appliedPoints,
        setAppliedPoints,
        pointsDiscount,
        totalDiscount,
        total: finalTotal,
        earnedPoints,
        formatKsh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
