"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import ProductFilter, { FilterValues } from './product/components/ProductFilter';
import Link from 'next/link';

// Product type based on schema.md
interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  condition: string;
  yearOfManufacture?: number | null;
  brand?: string | null;
  model?: string | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  weight?: number | null;
  material?: string | null;
  color?: string | null;
  originalPackaging?: boolean;
  manualIncluded?: boolean;
  workingConditionDesc?: string | null;
  thumbnail?: string | null;
  images?: string[];
  stock: number;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  averageRating?: number;
  reviewCount?: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    category: '',
    condition: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sellerId: '',
    isActive: '',
  });

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.condition) params.append('condition', filters.condition);
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.search) params.append('search', filters.search);
        if (filters.sellerId) params.append('sellerId', filters.sellerId);
        if (filters.isActive) params.append('isActive', filters.isActive);
        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`http://localhost:3000/api/products${query}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        setError('Could not load products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [filters]);

  return (
    <main className="bg-white min-h-screen px-0 py-0">
      {/* Header & Hero Section */}
      <header className="w-full border-b bg-white px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block mr-2">
            <Image src="/logo.jpg" alt="EcoFinds Logo" width={48} height={48} className="rounded-xl" />
          </span>
          <span className="text-2xl font-bold text-gray-900">EcoFinds</span>
          <span className="ml-6 flex items-center text-gray-700 text-base">
            <svg className="w-5 h-5 mr-1 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z"/></svg>
            Your city <span className="mx-1 font-semibold">New York, USA</span> <a href="#" className="text-indigo-600 underline ml-1">Change</a>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-1 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100">Sign in</button>
          <button className="flex items-center gap-2 px-5 py-1 rounded-lg bg-indigo-500 text-white font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68L19 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7"/></svg>
            My cart: 0
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="w-full flex justify-center bg-white py-8">
        <div className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-lg" style={{minHeight: 400}}>
          <Image src="/images/hero-burrito.jpg" alt="Lunch Set Box" fill className="object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center pl-16">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-white mb-4">Lunch Set Box</h1>
              <p className="text-lg text-white mb-6">
                This platform is more than just about commerce, it’s about making a positive impact. By encouraging the reuse of products, we reduce waste, lower carbon footprints, and promote a culture of conscious consumption. Every item sold contributes to a more sustainable future.
              </p>
              <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-6 py-3 rounded-full text-lg shadow">Order for $9.99</button>
            </div>
          </div>
          {/* Carousel arrows */}
          <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </section>

      {/* Features Row */}
      <section className="w-full flex justify-center mt-4 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <span className="inline-block bg-indigo-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h1l2 7a2 2 0 002 2h8a2 2 0 002-2l2-7h1"/></svg>
            </span>
            <div>
              <div className="font-semibold text-gray-900">Quick delivery</div>
              <div className="text-gray-500 text-sm">All you can do is just order and we can deliver within 5 mins</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <span className="inline-block bg-indigo-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 17v-1a4 4 0 014-4h8a4 4 0 014 4v1"/></svg>
            </span>
            <div>
              <div className="font-semibold text-gray-900">Easy pickup</div>
              <div className="text-gray-500 text-sm">All you can do is just order and we can deliver within 5 mins</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <span className="inline-block bg-indigo-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </span>
            <div>
              <div className="font-semibold text-gray-900">Super Dine-in</div>
              <div className="text-gray-500 text-sm">All you can do is just order and we can deliver within 5 mins</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Filter */}
      <div className="max-w-6xl mx-auto mb-8">
        <ProductFilter onFilterChange={handleFilterChange} isLoading={loading} />
      </div>

      {/* Most Popular Section */}
      <h2 className="text-3xl font-semibold mb-6">Most Popular</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading products...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <Link
              key={prod.id}
              href={`/product/${prod.id}`}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center relative transition-transform hover:scale-105 hover:shadow-lg focus:outline-none"
            >
              <div className="relative w-48 h-48 mb-4 flex items-center justify-center">
                <Image src={prod.thumbnail || '/images/placeholder.png'} alt={prod.title} fill className="object-contain rounded-xl" />
              </div>
              <div className="w-full text-left">
                <div className="text-indigo-600 font-semibold text-lg mb-1">{prod.price} ₹</div>
                <div className="font-medium text-gray-900 mb-1">{prod.title}</div>
                <div className="text-gray-500 text-sm mb-4 truncate">{prod.description}</div>
              </div>
              <button className="mt-auto w-full bg-indigo-100 text-indigo-600 font-medium py-2 rounded-lg hover:bg-indigo-200 transition">Add to basket</button>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}