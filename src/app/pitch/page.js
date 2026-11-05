'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatKsh } from '@/data/products';
import {
  FiTrendingUp,
  FiSmartphone,
  FiShoppingBag,
  FiCheckCircle,
  FiTruck,
  FiShield,
  FiDollarSign,
  FiCpu,
  FiArrowRight,
  FiPlay,
} from 'react-icons/fi';

export default function PitchPage() {
  const [dailyOrders, setDailyOrders] = useState(250);
  const [avgBasketKsh, setAvgBasketKsh] = useState(2200);

  const monthlyOrders = dailyOrders * 30;
  const monthlyRevenueKsh = monthlyOrders * avgBasketKsh;
  const estimatedGrossMarginKsh = Math.round(monthlyRevenueKsh * 0.18); // ~18% supermarket margin
  const annualRevenueKsh = monthlyRevenueKsh * 12;

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Pitch Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-block bg-amber-400 text-gray-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
            Enterprise Pitch &amp; Proposal Deck
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Selling Modern E-Commerce to{' '}
            <span className="text-[#E31E24]">Quickmart Supermarket Kenya</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            A turnkey, high-converting, omnichannel online grocery platform custom-engineered for Quickmart&apos;s 60+ branch network, featuring native Safaricom Lipa na M-Pesa, 45-min hyper-local dispatch, and Fresh Points loyalty.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-lg"
            >
              Test Customer Shopping Experience
            </Link>
            <Link
              href="/admin"
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors border border-gray-700"
            >
              Explore Store Manager Operations
            </Link>
          </div>
        </div>

        {/* 4 Core Value Pillars for Quickmart Management */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 text-[#E31E24] flex items-center justify-center text-xl">
              <FiSmartphone className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-white">Native Safaricom Lipa na M-Pesa</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Eliminates checkout friction. STK Push arrives instantly on the shopper&apos;s phone with automatic confirmation &amp; KRA ETR receipt generation.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 text-[#E31E24] flex items-center justify-center text-xl">
              <FiTruck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-white">Hyper-Local Branch Routing</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Orders auto-route to the closest branch (e.g. Kilimani, Westlands, Rongai) ensuring 45-min delivery and hot bakery / cold meat freshness.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 text-[#E31E24] flex items-center justify-center text-xl">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-white">Fresh Points Retention Engine</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Built-in loyalty scheme incentivizes recurrent weekly shopping. Shoppers earn points redeemable for discounts on next basket.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 text-[#E31E24] flex items-center justify-center text-xl">
              <FiCpu className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-white">React &amp; Next.js Backend</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sub-second page speeds, zero server lag during peak holiday rushes, mobile-first responsive design, and enterprise API route handlers.
            </p>
          </div>
        </div>

        {/* Interactive Financial Calculator for Quickmart Executives */}
        <div className="bg-gray-900 border border-red-900/40 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Financial Impact Model
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">
                Projected Revenue Uplift for Quickmart
              </h2>
            </div>
            <span className="bg-red-950/40 text-[#E31E24] border border-red-900/60 text-xs font-bold px-3 py-1.5 rounded-full self-start sm:self-auto">
              Based on 60 Branch Network
            </span>
          </div>

          {/* Sliders */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400">Daily Online Orders (Across All Branches):</span>
                <span className="text-[#E31E24] font-mono text-sm">{dailyOrders} orders / day</span>
              </div>
              <input
                type="range"
                min="50"
                max="1500"
                step="50"
                value={dailyOrders}
                onChange={(e) => setDailyOrders(Number(e.target.value))}
                className="w-full accent-[#E31E24] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>50 (Pilot Phase)</span>
                <span>500 (Moderate)</span>
                <span>1,500 (Full Rollout)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400">Average Kenyan Grocery Basket (KSh):</span>
                <span className="text-[#E31E24] font-mono text-sm">{formatKsh(avgBasketKsh)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="6000"
                step="200"
                value={avgBasketKsh}
                onChange={(e) => setAvgBasketKsh(Number(e.target.value))}
                className="w-full accent-[#E31E24] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>KSh 1,000</span>
                <span>KSh 3,000</span>
                <span>KSh 6,000</span>
              </div>
            </div>
          </div>

          {/* Output Cards */}
          <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-gray-800">
            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Estimated Monthly GMV</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {formatKsh(monthlyRevenueKsh)}
              </p>
              <p className="text-[11px] text-gray-500">{monthlyOrders.toLocaleString()} orders per month</p>
            </div>

            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Annual E-Commerce Sales</p>
              <p className="text-2xl sm:text-3xl font-black text-[#E31E24] font-mono">
                {formatKsh(annualRevenueKsh)}
              </p>
              <p className="text-[11px] text-gray-500">Projected new revenue channel</p>
            </div>

            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Est. Monthly Gross Margin (18%)</p>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                {formatKsh(estimatedGrossMarginKsh)}
              </p>
              <p className="text-[11px] text-gray-500">Net operating profit contribution</p>
            </div>
          </div>
        </div>

        {/* Live Pitch Demonstration Script */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-black text-white">
            Recommended Pitch Meeting Agenda for Quickmart
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-xs text-gray-300">
            <div className="space-y-2 bg-gray-950 p-5 rounded-2xl border border-gray-800">
              <span className="font-black text-[#E31E24] text-sm">Step 1: The Problem</span>
              <p className="leading-relaxed">
                Demonstrate how customers in Kilimani, Westlands, and Nakuru are moving to online grocery delivery, and how competitors like Carrefour and Naivas are capturing that demand without a seamless local Kenyan experience.
              </p>
            </div>

            <div className="space-y-2 bg-gray-950 p-5 rounded-2xl border border-gray-800">
              <span className="font-black text-[#E31E24] text-sm">Step 2: The Live Demo</span>
              <p className="leading-relaxed">
                Add Brookside milk, Jogoo unga, and fresh bread to the basket. Show the instant M-Pesa STK push simulation on screen. Let them see the official Quickmart Tax Invoice with ETR details!
              </p>
            </div>

            <div className="space-y-2 bg-gray-950 p-5 rounded-2xl border border-gray-800">
              <span className="font-black text-[#E31E24] text-sm">Step 3: The Close</span>
              <p className="leading-relaxed">
                Open the Store Manager Dashboard (`/admin`) to show how each of their 60 branches gets live orders, inventory alerts, and automated rider dispatch without extra hardware investment.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-3 pt-6">
          <p className="text-xs text-gray-400">Ready to present to Quickmart Supermarket?</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/"
              className="bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow"
            >
              Start Live Demo Walkthrough
            </Link>
            <Link
              href="/admin"
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors"
            >
              View Store Manager Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

