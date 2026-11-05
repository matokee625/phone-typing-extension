'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiHeart, FiStar, FiPlus, FiMinus, FiShoppingBag, FiCheck } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatKsh } from '@/data/products';

const badgeColors = {
  Sale: 'bg-[#E31E24] text-white',
  New: 'bg-blue-600 text-white',
  Organic: 'bg-[#E31E24] text-white',
  Popular: 'bg-amber-500 text-white',
  'Best Seller': 'bg-gray-900 text-white',
  'Fresh Today': 'bg-[#E31E24] text-white',
  'Bakery Fresh': 'bg-amber-600 text-white',
};

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { addToast } = useToast();

  const cartItem = cartItems.find((item) => String(item.id) === String(product.id));
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    addToast(`Added ${product.name} to basket`, 'success');
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity <= 1) {
      removeFromCart(product.id);
      addToast(`Removed ${product.name} from basket`, 'info');
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden relative">
      {/* Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setWishlisted(!wishlisted);
          addToast(
            wishlisted ? `Removed from saved items` : `Added ${product.name} to saved items`,
            'info'
          );
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${
          wishlisted
            ? 'bg-rose-50 text-rose-600'
            : 'bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-white'
        }`}
        aria-label="Toggle wishlist"
      >
        <FiHeart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Image & Badges */}
      <Link href={`/products/${product.id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.badge && (
            <span
              className={`px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-md uppercase shadow-sm ${
                badgeColors[product.badge] || 'bg-gray-800 text-white'
              }`}
            >
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <span className="capitalize">{product.category.replace('-', ' ')}</span>
          <span>•</span>
          <span className="text-gray-400">{product.unit}</span>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="font-bold text-gray-900 text-sm group-hover:text-[#E31E24] transition-colors line-clamp-2 leading-snug mb-2"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs text-amber-500 mb-3">
          <FiStar className="w-3.5 h-3.5 fill-current" />
          <span className="font-bold text-gray-800">{product.rating}</span>
          <span className="text-gray-400 text-[11px]">({product.reviewsCount || 45})</span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-black text-gray-900">
              {formatKsh(product.price)}
            </p>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">
                {formatKsh(product.originalPrice)}
              </p>
            )}
          </div>

          {/* Cart Controls */}
          {quantity === 0 ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 bg-[#E31E24] hover:bg-[#c41a1f] active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
              aria-label={`Add ${product.name} to basket`}
            >
              <FiShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-inner">
              <button
                type="button"
                onClick={handleDecrement}
                className="p-1.5 text-[#E31E24] hover:bg-red-100 transition-colors"
                aria-label="Decrease quantity"
              >
                <FiMinus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-black text-xs text-gray-900 min-w-[24px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="p-1.5 text-[#E31E24] hover:bg-red-100 transition-colors"
                aria-label="Increase quantity"
              >
                <FiPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
