import { products } from '@/data/products';
import ProductDetailClient from './ProductDetailClient';

export function generateStaticParams() {
  return products.map((product) => ({
    id: String(product.id),
  }));
}

export default function ProductPage({ params }) {
  return <ProductDetailClient id={params.id} />;
}
