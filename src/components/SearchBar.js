'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiArrowRight, FiX } from 'react-icons/fi';
import { products, formatKsh } from '@/data/products';

export default function SearchBar({ className = '' }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 0) {
      const q = value.toLowerCase().trim();
      const filtered = (products || [])
        .filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
        )
        .slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    setShowSuggestions(false);
    setQuery('');
    router.push(`/products/${product.id}`);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => query.trim() && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search milk, unga, beef, sukuma, bread, snacks..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent transition-all placeholder:text-gray-400 text-gray-800"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="absolute right-3 p-1 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-semibold px-3">
            <span>Matching Products</span>
            <span>Quickmart Inventory</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {suggestions.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSuggestionClick(product)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-red-50/70 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-[#E31E24]">
                    {product.name}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {product.unit} • <span className="capitalize">{product.category.replace('-', ' ')}</span>
                  </p>
                </div>
                <span className="text-xs font-bold text-[#E31E24] flex-shrink-0">
                  {formatKsh(product.price)}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full p-2.5 bg-gray-50 hover:bg-red-50 text-[#E31E24] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border-t border-gray-100"
          >
            <span>See all results for &quot;{query}&quot;</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
