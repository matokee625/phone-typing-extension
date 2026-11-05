'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBranch } from '@/context/BranchContext';
import { useToast } from '@/context/ToastContext';
import {
  FiMapPin,
  FiPhone,
  FiClock,
  FiCheck,
  FiSearch,
  FiShoppingBag,
  FiCheckCircle,
} from 'react-icons/fi';

export default function BranchesPage() {
  const { branches, selectedBranch, changeBranch } = useBranch();
  const { addToast } = useToast();

  const [cityFilter, setCityFilter] = useState('all');
  const [only24Hours, setOnly24Hours] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cities = ['all', 'Nairobi', 'Kiambu', 'Mombasa', 'Nakuru', 'Eldoret', 'Kisumu'];

  const filteredBranches = useMemo(() => {
    let result = [...branches];

    if (cityFilter !== 'all') {
      result = result.filter((b) => b.city.toLowerCase().includes(cityFilter.toLowerCase()));
    }

    if (only24Hours) {
      result = result.filter((b) => b.is24Hours);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q)
      );
    }

    return result;
  }, [branches, cityFilter, only24Hours, searchQuery]);

  const handleSelectBranch = (branch) => {
    changeBranch(branch.id);
    addToast(`Selected ${branch.name} as your primary shopping store!`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-8 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#E31E24]">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Store Locator</span>
        </nav>

        <div className="bg-gradient-to-r from-[#E31E24] via-[#c41a1f] to-[#991115] rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-amber-400 text-gray-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Nationwide Network
            </span>
            <h1 className="text-3xl sm:text-4xl font-black">
              Quickmart Supermarket Branches (60+)
            </h1>
            <p className="text-white/90 text-xs sm:text-sm max-w-xl">
              Locate your nearest Quickmart store across Nairobi, Kiambu, Rift Valley, Western, and the Kenyan Coast for in-store shopping or fast 45-min online delivery.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[200px]">
            <p className="text-xs text-white/80">Currently Shopping At:</p>
            <p className="font-black text-sm text-amber-300 mt-1">{selectedBranch.name}</p>
            <p className="text-[11px] text-white/90">{selectedBranch.city}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* City Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                  cityFilter === city
                    ? 'bg-[#E31E24] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {city === 'all' ? 'All Cities' : city}
              </button>
            ))}
          </div>

          {/* Search & 24/7 Checkbox */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                checked={only24Hours}
                onChange={(e) => setOnly24Hours(e.target.checked)}
                className="text-[#E31E24] focus:ring-[#E31E24] rounded"
              />
              <span>Open 24/7 Only</span>
            </label>

            <div className="relative min-w-[240px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search branch or road..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => {
            const isSelected = selectedBranch.id === branch.id;

            return (
              <div
                key={branch.id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg ${
                  isSelected ? 'border-[#E31E24] ring-2 ring-red-500/20' : 'border-gray-100'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#E31E24] bg-red-50 px-2.5 py-0.5 rounded-full uppercase">
                        {branch.city}
                      </span>
                      <h3 className="text-lg font-black text-gray-900 mt-1">
                        {branch.name}
                      </h3>
                    </div>
                    {branch.is24Hours && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        24 Hours
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                    <FiMapPin className="w-4 h-4 text-[#E31E24] flex-shrink-0 mt-0.5" />
                    <span>{branch.address}</span>
                  </p>

                  <div className="space-y-1 text-xs text-gray-500 pt-1">
                    <p className="flex items-center gap-2">
                      <FiClock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{branch.hours}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`tel:${branch.phone}`} className="hover:text-[#E31E24] font-semibold">
                        {branch.phone}
                      </a>
                    </p>
                    <p className="text-[11px] text-[#E31E24] font-mono font-bold">
                      Till: {branch.tillNumber}
                    </p>
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {branch.features.map((feat, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  {isSelected ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#E31E24]">
                      <FiCheckCircle className="w-4 h-4" />
                      <span>Current Store</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectBranch(branch)}
                      className="text-xs font-bold text-gray-700 hover:text-[#E31E24] hover:underline"
                    >
                      Set as My Store
                    </button>
                  )}

                  <Link
                    href="/products"
                    onClick={() => changeBranch(branch.id)}
                    className="flex items-center gap-1.5 bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm ml-auto"
                  >
                    <FiShoppingBag className="w-3.5 h-3.5" />
                    <span>Order Here</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

