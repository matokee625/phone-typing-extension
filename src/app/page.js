'use client';

import Link from 'next/link';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { categories, getFeaturedProducts, getDealsProducts, formatKsh } from '@/data/products';
import { weeklyDeals } from '@/data/deals';
import { useBranch } from '@/context/BranchContext';
import {
  FiTruck,
  FiShield,
  FiSmartphone,
  FiAward,
  FiArrowRight,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiTrendingUp,
} from 'react-icons/fi';

export default function HomePage() {
  const featuredProducts = getFeaturedProducts().slice(0, 8);
  const dealsProducts = getDealsProducts().slice(0, 4);
  const { selectedBranch } = useBranch();

  const trustFeatures = [
    {
      icon: <FiTruck className="w-6 h-6 text-[#E31E24]" />,
      title: '45-Min Express Delivery',
      description: 'Your groceries are hand-picked fresh from your local branch and delivered immediately to your gate.',
    },
    {
      icon: <FiSmartphone className="w-6 h-6 text-[#E31E24]" />,
      title: 'Lipa na M-Pesa Native',
      description: 'Zero hassle checkout with prompt STK push to your Safaricom line. Fast, cashless and verified.',
    },
    {
      icon: <FiShield className="w-6 h-6 text-[#E31E24]" />,
      title: 'Farm Fresh Guarantee',
      description: 'Daily fresh sukuma, spinach, milk, and butchery meats inspected for peak tenderness and nutrition.',
    },
    {
      icon: <FiAward className="w-6 h-6 text-[#E31E24]" />,
      title: 'Fresh Points Club',
      description: 'Earn 1 point for every KSh 100 spent. Redeem anytime for instant cash discounts on your shopping basket.',
    },
  ];

  const testimonials = [
    {
      quote:
        'Quickmart Kilimani delivered my hot crusty bread, Brookside milk, and fresh beef within 35 minutes! The M-Pesa prompt popped right up on my phone.',
      author: 'Wanjiku Mwangi',
      location: 'Kilimani, Nairobi',
      rating: 5,
    },
    {
      quote:
        'The sukuma wiki and red onions were so fresh, just like buying from the farm gate in Molo. Best online supermarket in Kenya.',
      author: 'David Ochieng',
      location: 'Westlands, Nairobi',
      rating: 5,
    },
    {
      quote:
        'Ordering from the Quickmart Nakuru branch while at the office was seamless. Click & collect ready when I drove by.',
      author: 'Mary Chebet',
      location: 'Nakuru Town',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <Hero />

      {/* Quickmart Pitch Callout Banner for Supermarket Executives */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 shadow-xl text-gray-950 flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-gray-950 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                  Pitch &amp; Demo Mode
                </span>
                <p className="font-extrabold text-sm sm:text-base">
                  Presenting this to Quickmart Supermarket Management?
                </p>
              </div>
              <p className="text-xs text-gray-900/80 mt-0.5">
                Explore our full Executive Pitch Deck, ROI analysis, multi-branch order dispatch, and Store Manager Admin portal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <Link
              href="/pitch"
              className="flex-1 sm:flex-none text-center bg-gray-950 hover:bg-gray-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <FiTrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Executive Pitch Deck</span>
            </Link>
            <Link
              href="/admin"
              className="flex-1 sm:flex-none text-center bg-white/90 hover:bg-white text-gray-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-colors"
            >
              <span>Manager Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Weekly Flyer Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Limited Time Promotions
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Quickmart Weekly Flyers &amp; Deals
            </h2>
          </div>
          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 text-[#E31E24] hover:text-[#c41a1f] font-bold text-xs sm:text-sm"
          >
            <span>View All Deals</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeklyDeals.map((deal) => (
            <div
              key={deal.id}
              className={`bg-gradient-to-br ${deal.bgColor} rounded-2xl p-5 text-white flex flex-col justify-between shadow-md hover:shadow-xl transition-all relative overflow-hidden`}
            >
              <div className="space-y-2">
                <span className="inline-block bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {deal.tag}
                </span>
                <h3 className="font-extrabold text-base leading-snug">{deal.title}</h3>
                <p className="text-white/80 text-xs leading-relaxed">{deal.subtitle}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                <span className="font-black text-xs bg-amber-400 text-gray-950 px-2 py-1 rounded-md">
                  {deal.discountBadge}
                </span>
                <Link
                  href={`/products?category=${deal.category}`}
                  className="text-xs font-bold text-white hover:text-amber-200 flex items-center gap-1"
                >
                  <span>{deal.buttonText}</span>
                  <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop By Aisle / Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Explore Quickmart Aisles
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1.5">
            Everything you need for your family, pantry, kitchen, and home
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Featured Products Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-[#E31E24] uppercase tracking-wider">
              Hand-Picked Daily
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Fresh Today at Quickmart
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[#E31E24] hover:text-[#c41a1f] font-bold text-xs sm:text-sm"
          >
            <span>See Full 40+ Items Catalog</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Quickmart Bakery & Butchery Special Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bakery Banner */}
          <div className="bg-gradient-to-tr from-amber-700 to-orange-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3 relative z-10 max-w-md">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Quickmart In-Store Bakery
              </span>
              <h3 className="text-3xl font-black leading-tight">
                Hot Ovens. Fresh Crusty Breads &amp; Golden Mandazis.
              </h3>
              <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
                Baked fresh every morning and afternoon in all our 60+ branch ovens. Warm sandwiches, birthday cakes, and tea treats.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <Link
                href="/products?category=bakery"
                className="inline-flex items-center gap-2 bg-white text-gray-950 font-black px-6 py-3 rounded-xl text-xs hover:bg-amber-100 transition-colors shadow-md"
              >
                <span>Order Oven-Fresh Bakery</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute -bottom-6 -right-6 text-9xl opacity-20 pointer-events-none">
              🍞
            </div>
          </div>

          {/* Butchery Banner */}
          <div className="bg-gradient-to-tr from-rose-900 to-red-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3 relative z-10 max-w-md">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Quickmart Prime Butchery
              </span>
              <h3 className="text-3xl font-black leading-tight">
                Grass-Fed Prime Beef, Goat Mbuzi &amp; Kenchic Chicken.
              </h3>
              <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
                Hand-trimmed by master butchers, vacuum-packed for cold-chain safety, and delivered cold to your kitchen.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <Link
                href="/products?category=meat-seafood"
                className="inline-flex items-center gap-2 bg-white text-gray-950 font-black px-6 py-3 rounded-xl text-xs hover:bg-rose-100 transition-colors shadow-md"
              >
                <span>Shop Prime Butchery</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute -bottom-6 -right-6 text-9xl opacity-20 pointer-events-none">
              🥩
            </div>
          </div>
        </div>
      </section>

      {/* Selected Branch Fulfillment Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E31E24] text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
              🏬
            </div>
            <div>
              <p className="text-xs font-bold text-[#E31E24] uppercase tracking-wider">
                Fulfilling Your Shopping From:
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                {selectedBranch.name}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {selectedBranch.address} • <strong>{selectedBranch.hours}</strong> • Delivery:{' '}
                <strong className="text-[#E31E24]">{selectedBranch.deliveryTime}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/branches"
              className="flex-1 md:flex-none text-center bg-white border border-red-200 text-gray-900 font-bold text-xs px-5 py-3 rounded-xl hover:bg-red-100/50 transition-colors shadow-sm"
            >
              Switch Branch
            </Link>
            <Link
              href="/products"
              className="flex-1 md:flex-none text-center bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              Shop This Store
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Quickmart Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            Why Kenyans Love Quickmart
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Built for everyday convenience, fresh taste, and unmatched affordability
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto sm:mx-0">
                {feat.icon}
              </div>
              <h3 className="font-bold text-base text-gray-900">{feat.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="bg-gray-100/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Trusted by Thousands of Kenyan Households
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Read real reviews from our shoppers across Nairobi, Nakuru, and Mombasa
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400 text-sm">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                    &quot;{t.quote}&quot;
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="font-bold text-xs text-gray-900">{t.author}</p>
                  <p className="text-[11px] text-gray-500">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / Karibu Discount Code */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#E31E24] via-[#c41a1f] to-[#991115] rounded-3xl p-8 md:p-12 text-white text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-4">
            <span className="bg-amber-400 text-gray-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Voucher Code: KARIBU
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              Get KSh 200 Off Your First Order!
            </h2>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Subscribe to the Quickmart Fresh Newsletter for weekly grocery flyers, secret bakery flash sales, and special weekend butchery offers.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing! Use coupon code KARIBU at checkout for KSh 200 off.');
              }}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                required
                placeholder="Enter your phone or email..."
                className="flex-1 px-4 py-3 rounded-xl bg-white text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm transition-colors shadow-md"
              >
                Claim Voucher
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
