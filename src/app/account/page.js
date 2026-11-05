'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AuthPage() {
  const router = useRouter();
  const { user, login, register, logout } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    street: '',
    building: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const res = await login(formData.email, formData.password);
      setLoading(false);
      if (res.success) {
        addToast(`Karibu sana, ${res.user.fullName}!`, 'success');
        router.push(res.user.role === 'admin' ? '/admin' : '/account');
      } else {
        addToast(res.message || 'Login failed', 'error');
      }
    } else {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.street
          ? {
              fullName: formData.fullName,
              phone: formData.phone,
              street: formData.street,
              building: formData.building,
              city: 'Nairobi',
              isDefault: true,
            }
          : null,
      };

      const res = await register(payload);
      setLoading(false);
      if (res.success) {
        addToast(res.message, 'success');
        router.push('/account');
      } else {
        addToast(res.message || 'Registration failed', 'error');
      }
    }
  };

  if (user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 text-[#E31E24] rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {user.fullName ? user.fullName[0].toUpperCase() : 'Q'}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.fullName}</h1>
          <p className="text-gray-500 mb-6">{user.email} &bull; {user.phone}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8 text-left">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F37023]">Quickmart Loyalty</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{user.loyaltyPoints || 0} Points</p>
              <p className="text-xs text-gray-500 mt-1">Worth KSh {(user.loyaltyPoints || 0) * 1} in discounts</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Account Role</span>
              <p className="text-2xl font-extrabold capitalize text-gray-900 mt-1">{user.role || 'Shopper'}</p>
              <p className="text-xs text-gray-500 mt-1">Verified Member</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-semibold transition"
              >
                Go to Admin Portal &rarr;
              </Link>
            )}
            <Link
              href="/orders"
              className="bg-[#E31E24] hover:bg-[#c9181e] text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-md shadow-red-200"
            >
              View Order History
            </Link>
            <button
              onClick={() => {
                logout();
                addToast('Logged out successfully', 'info');
              }}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="bg-[#E31E24] text-white font-extrabold text-xl px-2.5 py-1 rounded-md">QUICKMART</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Sign in to your account' : 'Create Quickmart Account'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login'
              ? 'Access saved addresses, loyalty points and order history'
              : 'Earn 100 free Loyalty Points on registration!'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Kelvin Mwangi"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 0712345678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none text-sm"
            />
          </div>

          {mode === 'register' && (
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Delivery Address (Optional)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="street"
                  placeholder="Street / Road"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#E31E24] focus:outline-none"
                />
                <input
                  type="text"
                  name="building"
                  placeholder="Apartment / Hse #"
                  value={formData.building}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#E31E24] focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#E31E24] hover:bg-[#c9181e] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-md shadow-red-200"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Tip: Enter an email containing <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">admin</code> to automatically test manager permissions.
        </div>
      </div>
    </div>
  );
}

