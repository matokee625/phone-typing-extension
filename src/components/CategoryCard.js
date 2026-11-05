import Link from 'next/link';

export default function CategoryCard({ category }) {
  const icon = category.icon || category.emoji || '🛒';
  const colorClasses = category.color || 'bg-red-50 text-[#E31E24] border-red-200';

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group block"
    >
      <div
        className={`flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md border ${colorClasses}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 text-center line-clamp-1">
          {category.name}
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Explore aisle &rarr;</p>
      </div>
    </Link>
  );
}
