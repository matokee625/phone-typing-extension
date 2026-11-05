'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { products, categories, formatKsh } from '@/data/products';
import { FiFilter, FiX, FiChevronDown, FiCheck, FiSearch } from 'react-icons/fi';

function ProductsCatalog() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParam]);

  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'under100', label: 'Under KSh 100' },
    { id: '100to300', label: 'KSh 100 – KSh 300' },
    { id: '300to700', label: 'KSh 300 – KSh 700' },
    { id: 'over700', label: 'Over KSh 700' },
  ];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Price range filter
    if (priceRange === 'under100') {
      result = result.filter((p) => p.price < 100);
    } else if (priceRange === '100to300') {
      result = result.filter((p) => p.price >= 100 && p.price <= 300);
    } else if (priceRange === '300to700') {
      result = result.filter((p) => p.price > 300 && p.price <= 700);
    } else if (priceRange === 'over700') {
      result = result.filter((p) => p.price > 700);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    return result;
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange('all');
    setSortBy('default');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    priceRange !== 'all' ||
    sortBy !== 'default';

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <nav className="text-xs text-gray-500 mb-1">
              <Link href="/" className="hover:text-[#E31E24]">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800 font-semibold">Quickmart Catalog</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              All Aisles &amp; Groceries
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing <strong className="text-[#E31E24]">{filteredProducts.length}</strong> items available in-store
            </p>
          </div>

          {/* Quick Search inside page */}
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter catalog..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-1.5 bg-[#E31E24] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm"
            >
              <FiFilter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* ── Mobile Filter Drawer (slides in from bottom on small screens) ── */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            {/* Drawer */}
            <div className="relative w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
              {/* Handle + Title */}
              <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
                  <h3 className="font-extrabold text-base text-gray-900">Filter & Sort</h3>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <FiX className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Category */}
                <div>
                  <p className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">🏪 Shop by Aisle</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setSelectedCategory('all'); setShowFilters(false); }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-2 transition-colors ${
                        selectedCategory === 'all' ? 'bg-[#E31E24] text-white' : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      <span>🛒</span><span>All Products</span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.slug); setShowFilters(false); }}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-2 transition-colors ${
                          selectedCategory === cat.slug ? 'bg-[#E31E24] text-white' : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">💰 Price Range</p>
                  <div className="space-y-2">
                    {priceRanges.map((pr) => (
                      <label key={pr.id} className={`flex items-center gap-3 text-xs rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                        priceRange === pr.id ? 'bg-red-50 text-[#E31E24] font-bold border border-red-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        <input type="radio" name="priceRangeMobile" checked={priceRange === pr.id} onChange={() => setPriceRange(pr.id)} className="text-[#E31E24]" />
                        {pr.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Apply button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-colors"
                >
                  Show {filteredProducts.length} Products
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:flex lg:flex-col space-y-5">

            {/* ── Shop by Aisle ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏪</span>
                  <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">Shop by Aisle</h3>
                </div>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-[11px] text-[#E31E24] font-bold hover:underline flex items-center gap-1"
                  >
                    <FiX className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              <div className="p-3 space-y-1">
                {/* All Products pill */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-[#E31E24] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-sm">🛒</span>
                    <span>All Products</span>
                  </span>
                  <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-lg ${
                    selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {products.length}
                  </span>
                </button>

                {/* Category buttons */}
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.slug).length;
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all group ${
                        isSelected
                          ? 'bg-[#E31E24] text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={`text-sm w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-white/20' : cat.color + ' border'
                        }`}>
                          {cat.icon}
                        </span>
                        <span className="leading-tight">{cat.name}</span>
                      </span>
                      <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-lg flex-shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Price Range Filter ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">💰</span>
                  <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">Price Range</h3>
                </div>
                {priceRange !== 'all' && (
                  <button
                    onClick={() => setPriceRange('all')}
                    className="text-[11px] text-[#E31E24] font-bold hover:underline flex items-center gap-1"
                  >
                    <FiX className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
              <div className="p-4 space-y-2">
                {priceRanges.map((pr) => (
                  <label
                    key={pr.id}
                    className={`flex items-center gap-3 text-xs cursor-pointer rounded-xl px-3 py-2.5 transition-all ${
                      priceRange === pr.id
                        ? 'bg-red-50 text-[#E31E24] font-bold border border-red-200'
                        : 'text-gray-600 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceRangeDesktop"
                      checked={priceRange === pr.id}
                      onChange={() => setPriceRange(pr.id)}
                      className="text-[#E31E24] focus:ring-[#E31E24]"
                    />
                    <span>{pr.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Sort (quick) ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <span className="text-base">↕️</span>
                <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">Sort By</h3>
              </div>
              <div className="p-4 space-y-1">
                {[
                  { value: 'default', label: 'Featured', icon: '⭐' },
                  { value: 'popular', label: 'Most Popular', icon: '🔥' },
                  { value: 'rating', label: 'Highest Rated', icon: '⭐' },
                  { value: 'price-asc', label: 'Price: Low → High', icon: '⬆️' },
                  { value: 'price-desc', label: 'Price: High → Low', icon: '⬇️' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      sortBy === opt.value
                        ? 'bg-[#E31E24] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                    {sortBy === opt.value && <FiCheck className="ml-auto w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Fresh Promise Banner ── */}
            <div className="bg-gradient-to-br from-[#E31E24] to-[#991115] p-5 rounded-2xl text-white shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <h4 className="font-bold text-sm">Quickmart Fresh Promise</h4>
              </div>
              <p className="text-xs text-white/85 leading-relaxed">
                If any fresh produce or meat does not meet your standard, return it with the rider for an instant swap or full refund — no questions asked.
              </p>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <span className="text-xs text-white font-semibold">📞 0800 723 456</span>
                <span className="text-amber-300 text-xs">· Free helpline</span>
              </div>
            </div>

          </aside>

          {/* Main Products Grid */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Toolbar (Sort & Active Filter Pills) */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
              {/* Active Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                    <span>Clear all filters</span>
                  </button>
                )}
                {selectedCategory !== 'all' && (
                  <span className="text-[11px] font-semibold bg-red-50 text-[#E31E24] border border-red-200 px-2.5 py-1 rounded-lg">
                    Aisle: {selectedCategory.replace('-', ' ')}
                  </span>
                )}
                {searchQuery && (
                  <span className="text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg">
                    Keyword: &quot;{searchQuery}&quot;
                  </span>
                )}
                {priceRange !== 'all' && (
                  <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
                    {priceRanges.find((p) => p.id === priceRange)?.label}
                  </span>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 ml-auto text-xs">
                <span className="text-gray-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
                >
                  <option value="default">Featured / Default</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
                <div className="text-6xl">🔍</div>
                <h3 className="text-xl font-bold text-gray-900">
                  No products matched your search
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                  We couldn&apos;t find anything matching your current filters. Try searching for milk, unga, bread, sukuma, or meat.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition-colors"
                >
                  View All Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-gray-500">Loading Quickmart Aisles...</p>
          </div>
        </div>
      }
    >
      <ProductsCatalog />
    </Suspense>
  );
}
