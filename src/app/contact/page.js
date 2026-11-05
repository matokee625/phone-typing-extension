'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiMessageSquare,
  FiCheckCircle,
} from 'react-icons/fi';

export default function ContactPage() {
  const { addToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    branch: 'Quickmart Kilimani',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Thank you! Your inquiry has been sent to Quickmart Customer Care.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] py-12 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#E31E24]">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Contact Us</span>
        </nav>

        <div className="bg-gradient-to-r from-[#E31E24] via-[#c41a1f] to-[#991115] rounded-3xl p-8 text-white shadow-xl">
          <span className="bg-amber-400 text-gray-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            We Are Here For You
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">
            Quickmart Customer Care &amp; Inquiries
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-xl">
            Have questions about an online order, branch inventory, bulk corporate supply, or supplier partnership? Reach out to our dedicated team.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center">
                  <FiPhone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Toll-Free Customer Line</h3>
                  <p className="text-xs text-[#E31E24] font-bold">+254 709 123 000</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 pl-13">
                Available daily from 6:30 AM to 11:00 PM for order assistance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center">
                  <FiMail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Email Customer Service</h3>
                  <p className="text-xs text-[#E31E24] font-bold">customercare@quickmart.co.ke</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 pl-13">
                For feedback, receipts, KRA tax invoices, and partnership inquiries.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Head Office Location</h3>
                  <p className="text-xs text-gray-700 font-medium">Argwings Kodhek Road, Kilimani</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 pl-13">
                Opposite Yaya Centre, Nairobi, Kenya.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-xs text-gray-900 space-y-2">
              <h4 className="font-bold flex items-center gap-2">
                <FiClock className="w-4 h-4 text-[#E31E24]" />
                <span>24/7 Outlets Hotline</span>
              </h4>
              <p className="text-[11px] text-gray-700 leading-relaxed">
                Need midnight delivery or early morning breakfast groceries? Our 24-hour branches in Kilimani, Westlands, and Nakuru Highway are always staffed and ready to pack your order!
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">Send Us a Direct Message</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Fill in your details below and a Quickmart branch manager will respond within 2 hours.
                </p>
              </div>

              {submitted ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-red-100 text-[#E31E24] rounded-full flex items-center justify-center mx-auto">
                    <FiCheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-gray-900 text-base">Message Sent Successfully!</h4>
                  <p className="text-xs text-gray-700">
                    Thank you, {formData.name}. Our customer care team has received your inquiry regarding {formData.branch}.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', phone: '', email: '', branch: 'Quickmart Kilimani', message: '' });
                    }}
                    className="text-xs font-bold text-[#E31E24] hover:underline pt-2 inline-block"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Samuel Kimani"
                        className="w-full text-xs sm:text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Phone Number (Safaricom) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="07XX XXX XXX"
                        className="w-full text-xs sm:text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@email.com"
                        className="w-full text-xs sm:text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Related Quickmart Store
                      </label>
                      <select
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full text-xs sm:text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none font-semibold text-gray-800"
                      >
                        <option value="Quickmart Kilimani">Quickmart Kilimani (Nairobi)</option>
                        <option value="Quickmart Westlands">Quickmart Westlands (Nairobi)</option>
                        <option value="Quickmart Lavington">Quickmart Lavington (Nairobi)</option>
                        <option value="Quickmart Roysambu">Quickmart Roysambu (TRM)</option>
                        <option value="Quickmart Rongai">Quickmart Rongai</option>
                        <option value="Quickmart Nakuru Highway">Quickmart Nakuru Highway</option>
                        <option value="Quickmart Mombasa Bandari">Quickmart Mombasa Bandari</option>
                        <option value="Quickmart Eldoret Pioneer">Quickmart Eldoret Pioneer</option>
                        <option value="Quickmart Kisumu Mega">Quickmart Kisumu Mega</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Your Message or Inquiry *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help you..."
                      className="w-full text-xs sm:text-sm p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#E31E24] hover:bg-[#c41a1f] text-white font-black text-xs sm:text-sm py-3.5 px-6 rounded-xl transition-colors shadow-md"
                  >
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

