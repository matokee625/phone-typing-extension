'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getDealsProducts, formatKsh } from '@/data/products';
import { weeklyDeals } from '@/data/deals';
import { FiClock, FiTag, FiShoppingBag, FiArrowRight, FiCheck } from 'react-icons/fi';

export default function DealsPage() {
  const dealsProducts = getDealsProducts();
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 space-y-12">
      {/* Deals Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-rose-700 via-orange-600 to-amber-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <FiClock className="w-3.5 h-3.5" />
              <span>Flash Deals Ending Today</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              Quickmart Weekly Super Savers &amp; Crazy Offers
            </h1>

            <p className="text-orange-100 text-xs sm:text-sm leading-relaxed">
              Save big on fresh vegetables, prime beef, Brookside dairy, Kenchic chicken, and pantry essentials across all branches.
            </p>

            {/* Countdown Clock */}
            <div className="flex items-center gap-3 pt-2">
              <div className="bg-gray-950/80 rounded-2xl p-3 min-w-[64px] text-center shadow">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Hours</p>
              </div>

              <span className="text-2xl font-bold">:</span>

              <div className="bg-gray-950/80 rounded-2xl p-3 min-w-[64px] text-center shadow">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Mins</p>
              </div>

              <span className="text-2xl font-bold">:</span>

              <div className="bg-gray-950/80 rounded-2xl p-3 min-w-[64px] text-center shadow">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Secs</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 -right-8 text-9xl opacity-20 pointer-events-none">
            🏷️
          </div>
        </div>
      </div>

      {/* Featured Weekly Flyers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-[#E31E24] uppercase tracking-wider">
            Current Campaigns
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Weekly Quickmart In-Store Flyers
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeklyDeals.map((deal) => (
            <div
              key={deal.id}
              className={`bg-gradient-to-br ${deal.bgColor} rounded-3xl p-6 text-white flex flex-col justify-between shadow-md space-y-4`}
            >
              <div className="space-y-2">
                <span className="inline-block bg-white/20 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  {deal.tag}
                </span>
                <h3 className="text-lg font-black leading-snug">{deal.title}</h3>
                <p className="text-xs text-white/80 leading-relaxed">{deal.subtitle}</p>
              </div>

              <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                <span className="bg-amber-400 text-gray-950 text-xs font-black px-2 py-1 rounded-md">
                  {deal.discountBadge}
                </span>
                <Link
                  href={`/products?category=${deal.category}`}
                  className="text-xs font-bold text-white hover:underline flex items-center gap-1"
                >
                  <span>Shop</span>
                  <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discounted Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Price Drops
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              On-Sale Supermarket Items ({dealsProducts.length})
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-[#E31E24] hover:text-[#c41a1f]"
          >
            View All Products &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {dealsProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

