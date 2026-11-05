import Link from 'next/link';
import { FiCheckCircle, FiAward, FiTruck, FiShield, FiHeart } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F2F2F2] py-12 space-y-16">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#E31E24] via-[#c41a1f] to-[#991115] rounded-3xl p-8 sm:p-14 text-white shadow-xl text-center max-w-4xl mx-auto space-y-4">
          <span className="bg-amber-400 text-gray-950 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            Our Kenya Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Fresh &amp; Easy, Every Single Day
          </h1>
          <p className="text-white/90 text-xs sm:text-sm sm:leading-relaxed max-w-2xl mx-auto">
            From our first store in Nakuru to over 60 premier supermarkets across Nairobi, Kiambu, Rift Valley, Western, and Mombasa, Quickmart has stood for farm-fresh groceries, oven-hot bakery, and unbeatable everyday value.
          </p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-[#E31E24]">60+</p>
            <p className="text-xs font-bold text-gray-900">Modern Supermarket Stores</p>
            <p className="text-[11px] text-gray-500">Across 14 counties in Kenya</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-amber-500">45 Mins</p>
            <p className="text-xs font-bold text-gray-900">Average Delivery Time</p>
            <p className="text-[11px] text-gray-500">From local branch to your doorstep</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-[#E31E24]">10,000+</p>
            <p className="text-xs font-bold text-gray-900">Kenyan Farmers Supported</p>
            <p className="text-[11px] text-gray-500">Daily farm-gate sourcing</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-amber-500">24/7</p>
            <p className="text-xs font-bold text-gray-900">Round-The-Clock Outlets</p>
            <p className="text-[11px] text-gray-500">Kilimani, Westlands, Nakuru Highway</p>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E31E24] text-xl font-black">
              🥬
            </div>
            <h3 className="text-lg font-black text-gray-900">Farm-To-Shelf Daily</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              We source directly from smallholder Kenyan farmers in Kinangop, Molo, Meru, and Kisii. Our cold-chain ensures your sukuma wiki, spinach, tomatoes, and milk are harvested and served at peak freshness.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-xl font-black">
              🍞
            </div>
            <h3 className="text-lg font-black text-gray-900">In-Store Bakery &amp; Deli</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every Quickmart branch houses state-of-the-art ovens and a dedicated culinary team. Hot crusty white bread, mandazis, doughnuts, and savoury meat pies baked fresh three times daily.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 text-xl font-black">
              🥩
            </div>
            <h3 className="text-lg font-black text-gray-900">Master Butchery &amp; Halal</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Government inspected, 100% Halal certified prime beef cuts, goat mbuzi choma, and Kenchic chicken. Trimmed to your exact liking by our friendly certified butchers.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h2 className="text-2xl font-black text-gray-900">Ready to Experience Quickmart?</h2>
        <div className="flex justify-center gap-3">
          <Link
            href="/products"
            className="bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow"
          >
            Start Fresh Shopping
          </Link>
          <Link
            href="/branches"
            className="bg-white border border-gray-200 text-gray-800 font-bold text-xs px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Find Nearest Store
          </Link>
        </div>
      </div>
    </div>
  );
}

