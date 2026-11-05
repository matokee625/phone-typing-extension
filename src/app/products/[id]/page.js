import { products } from '@/data/products';
import ProductDetailClient from '@/app/product/[id]/ProductDetailClient';

export function generateStaticParams() {
  return products.map((product) => ({
    id: String(product.id),
  }));
}

export default function ProductDetailPage({ params }) {
  return <ProductDetailClient id={params.id} />;
}

