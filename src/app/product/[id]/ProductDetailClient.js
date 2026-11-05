'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useBranch } from '@/context/BranchContext';
import { getProductById, getProductsByCategory, formatKsh } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import {
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiStar,
  FiCheck,
  FiClock,
  FiSmartphone,
} from 'react-icons/fi';

export default function ProductDetailClient({ id }) {
  const product = getProductById(id);
  const { addToCart, cartItems } = useCart();
  const { addToast } = useToast();
  const { selectedBranch } = useBranch();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center max-w-md w-full space-y-4">
          <div className="text-6xl">🛒</div>
          <h1 className="text-2xl font-black text-gray-900">
            Product Not Found
          </h1>
          <p className="text-xs text-gray-500">
            This item may be temporarily out of stock or moved to another aisle.
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow"
          >
            Back to Quickmart Aisles
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => String(p.id) !== String(product.id))
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    addToast(`Added ${quantity}x ${product.name} to your basket!`, 'success');
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`w-4 h-4 ${
            i <= Math.floor(rating || 0)
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-8">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#E31E24]">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#E31E24]">
            Aisles
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="capitalize hover:text-[#E31E24]"
          >
            {product.category.replace('-', ' ')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* Main Detail Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Product Image */}
            <div className="relative aspect-square rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-[#E31E24] text-white text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow">
                  {product.badge}
                </span>
              )}
              {discount && (
                <span className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Right: Info & Purchase Controls */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-red-50 text-[#E31E24] text-xs font-bold px-2.5 py-0.5 rounded-full capitalize">
                    {product.category.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600 font-medium">Unit: {product.unit}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
                  <span className="text-xs font-bold text-gray-800">{product.rating} / 5.0</span>
                  <span className="text-xs text-gray-400">
                    ({product.reviewsCount || 120} verified Kenyan customer reviews)
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-2 border-t border-gray-100">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900">
                    {formatKsh(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatKsh(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 font-medium">VAT Inclusive</span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-2">
                  {product.description}
                </p>

                {/* Stock & Fulfillment info */}
                <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#E31E24] font-bold">
                    <FiCheck className="w-4 h-4" />
                    <span>In Stock at {selectedBranch.name}</span>
                  </div>
                  <p className="text-gray-600 text-[11px]">
                    Fresh batch checked. Available for immediate 45-min doorstep delivery or free click &amp; collect pickup.
                  </p>
                </div>
              </div>

              {/* Add to Cart Stepper */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-3 text-gray-700 hover:bg-gray-200 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-black text-sm text-gray-900 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-3 text-gray-700 hover:bg-gray-200 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c41a1f] text-white font-black py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-98 text-sm"
                  >
                    <FiShoppingBag className="w-5 h-5" />
                    <span>Add to Basket • {formatKsh(product.price * quantity)}</span>
                  </button>
                </div>

                {/* Quick Trust Icons */}
                <div className="grid grid-cols-3 gap-3 pt-3 text-center text-xs text-gray-600">
                  <div className="p-2.5 rounded-xl bg-gray-50 flex flex-col items-center gap-1">
                    <FiTruck className="w-4 h-4 text-[#E31E24]" />
                    <span className="font-semibold text-[11px]">45-Min Delivery</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 flex flex-col items-center gap-1">
                    <FiSmartphone className="w-4 h-4 text-[#E31E24]" />
                    <span className="font-semibold text-[11px]">Lipa na M-Pesa</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 flex flex-col items-center gap-1">
                    <FiShield className="w-4 h-4 text-[#E31E24]" />
                    <span className="font-semibold text-[11px]">Fresh Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Customers Also Shopped For In This Aisle
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
