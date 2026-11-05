'use client';

import Link from 'next/link';
import { FiShoppingBag, FiTruck, FiShield, FiSmartphone, FiMapPin, FiClock, FiTag } from 'react-icons/fi';
import { useBranch } from '@/context/BranchContext';

export default function Hero() {
  const { selectedBranch } = useBranch();

  return (
    <section className="relative overflow-hidden bg-[#E31E24]">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* White diagonal slice at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#F2F2F2]"
        style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">

          {/* Left */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
              <span>Kenya's Favourite Supermarket — 60+ Branches Nationwide</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Fresh Groceries,{' '}
              <span className="text-amber-300 underline decoration-amber-300/40">Delivered Fast</span>
            </h1>

            <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Farm-fresh vegetables, butchery meats, hot bakery, and household essentials delivered from your local{' '}
              <strong>{selectedBranch.name}</strong> in just 45 minutes.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#F2F2F2] text-[#E31E24] font-black px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm"
              >
                <FiShoppingBag className="w-4 h-4" />
                <span>Shop Now</span>
              </Link>
              <Link
                href="/deals"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3.5 rounded-xl transition-all text-sm"
              >
                <FiTag className="w-4 h-4" />
                <span>Weekly Deals</span>
              </Link>
              <Link
                href="/branches"
                className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white px-3 py-2 font-medium"
              >
                <FiMapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>Branch: {selectedBranch.name}</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-white/20 grid grid-cols-3 gap-3 text-left">
              {[
                { icon: <FiClock className="w-5 h-5" />, title: '45-Min Express', sub: 'Doorstep Delivery' },
                { icon: <FiSmartphone className="w-5 h-5" />, title: 'Lipa na M-Pesa', sub: 'Instant STK Push' },
                { icon: <FiShield className="w-5 h-5" />, title: 'Fresh Guarantee', sub: 'Farm Quality Daily' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-amber-300 flex-shrink-0">
                    {b.icon}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">{b.title}</p>
                    <p className="text-white/70 text-[10px]">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Grocery Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E31E24] flex items-center justify-center text-white font-black text-sm">QM</div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Quickmart Daily Fresh</h3>
                    <p className="text-xs text-gray-400">Harvested &amp; Baked Today</p>
                  </div>
                </div>
                <span className="bg-[#E31E24] text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase">
                  In Stock
                </span>
              </div>

              <div className="space-y-2.5 py-4">
                {[
                  { emoji: '🍞', name: 'Quickmart White Loaf', sub: 'Oven Fresh · 800g', price: 'KSh 90' },
                  { emoji: '🥛', name: 'Brookside Fresh Milk 500ml', sub: 'Daily Cold Chain', price: 'KSh 65' },
                  { emoji: '🥬', name: 'Fresh Sukuma Wiki Bunch', sub: 'Kinangop Highland', price: 'KSh 35' },
                  { emoji: '🥩', name: 'Beef Stew Cut 1kg', sub: 'Grade A Butchery', price: 'KSh 850' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#F2F2F2] hover:bg-red-50 p-3 rounded-2xl transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <p className="font-bold text-xs text-gray-900 group-hover:text-[#E31E24] transition-colors">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.sub}</p>
                      </div>
                    </div>
                    <span className="font-black text-[#E31E24] text-xs whitespace-nowrap">{item.price}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/products"
                className="w-full flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-sm py-3.5 rounded-xl transition-colors shadow-md"
              >
                <FiShoppingBag className="w-4 h-4" />
                Start Shopping — {selectedBranch.name}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
