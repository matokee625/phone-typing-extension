import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiClock, FiShield, FiTrendingUp, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">

      {/* Top Feature Strip */}
      <div className="bg-[#E31E24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: '🥬', title: 'Daily Fresh Harvest', sub: 'Direct from Kinangop & Molo' },
              { emoji: '📱', title: 'Lipa na M-Pesa', sub: 'Instant STK Push checkout' },
              { emoji: '🚚', title: '45-Min Express Rider', sub: 'From your nearest branch' },
              { emoji: '⭐', title: 'Fresh Points Rewards', sub: 'Earn on every KSh spent' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-center sm:text-left flex-col sm:flex-row">
                <span className="text-3xl">{f.emoji}</span>
                <div>
                  <h4 className="font-bold text-sm text-white">{f.title}</h4>
                  <p className="text-xs text-white/70">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#E31E24] flex items-center justify-center text-white font-black text-lg">Q</div>
              <span className="text-2xl font-black text-white">
                Quick<span className="text-[#E31E24]">mart</span>
              </span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              Quickmart Supermarket is Kenya's leading homegrown retail chain with 60+ branches across Nairobi, Nakuru, Eldoret, Kisumu, and the Coast. Fresh &amp; Easy every day.
            </p>
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1.5">
              <p className="text-[#E31E24] font-bold flex items-center gap-1.5">
                <FiShield className="w-4 h-4" />
                <span>Certified Kenyan Retailer</span>
              </p>
              <p className="text-gray-400 text-[11px]">KRA ETR Certified · CMA Compliant · M-Pesa Business</p>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { Icon: FiFacebook, href: '#', label: 'Facebook' },
                { Icon: FiInstagram, href: '#', label: 'Instagram' },
                { Icon: FiTwitter, href: '#', label: 'Twitter/X' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#E31E24] flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Aisles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Fresh Aisles</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {[
                { label: 'Fruits & Vegetables', slug: 'fruits-vegetables' },
                { label: 'Butchery & Fish', slug: 'meat-seafood' },
                { label: 'Bakery & Deli', slug: 'bakery' },
                { label: 'Dairy & Eggs', slug: 'dairy-eggs' },
                { label: 'Unga & Pantry', slug: 'pantry' },
                { label: 'Household & Cleaning', slug: 'household' },
              ].map((a) => (
                <li key={a.slug}>
                  <Link href={`/products?category=${a.slug}`} className="hover:text-[#E31E24] transition-colors">
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Services</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {[
                { label: 'Track My Order', href: '/orders' },
                { label: 'Weekly Deals', href: '/deals' },
                { label: '60+ Branches', href: '/branches' },
                { label: 'Store Manager Portal', href: '/admin' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'About Quickmart', href: '/about' },
              ].map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="hover:text-[#E31E24] transition-colors">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Contact</h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2.5">
                <FiMapPin className="w-4 h-4 text-[#E31E24] flex-shrink-0 mt-0.5" />
                <span>Argwings Kodhek Rd, Kilimani, Nairobi</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FiPhone className="w-4 h-4 text-[#E31E24] flex-shrink-0" />
                <a href="tel:+254709123000" className="hover:text-white">+254 709 123 000</a>
              </li>
              <li className="flex items-center gap-2.5">
                <FiMail className="w-4 h-4 text-[#E31E24] flex-shrink-0" />
                <a href="mailto:customercare@quickmart.co.ke" className="hover:text-white">customercare@quickmart.co.ke</a>
              </li>
              <li className="flex items-center gap-2.5">
                <FiClock className="w-4 h-4 text-[#E31E24] flex-shrink-0" />
                <span>24/7 Select Outlets</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Quickmart Supermarket Ltd. All rights reserved.</p>
          <p>Powered by Safaricom M-Pesa · KRA ETR Certified · 100% Kenyan 🇰🇪</p>
        </div>
      </div>
    </footer>
  );
}
