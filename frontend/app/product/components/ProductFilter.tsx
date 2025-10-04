'use client';

import { useState } from 'react';

interface ProductFilterProps {
  onFilterChange: (filters: FilterValues) => void;
  isLoading?: boolean;
}

export interface FilterValues {
  category: string;
  condition: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  search: string;
  sellerId: string;
  isActive: string;
}

const categories = [
  'Electronics',
  'Books',
  'Clothing',
  'Home',
  'Sports',
  'Automotive',
  'Health & Beauty',
  'Toys & Games',
  'Arts & Crafts',
  'Music & Movies'
];

const conditions = [
  'New',
  'Like New', 
  'Good',
  'Fair',
  'Poor',
  'Refurbished'
];

export default function ProductFilter({ onFilterChange, isLoading = false }: ProductFilterProps) {
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

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterValues = {
      category: '',
      condition: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sellerId: '',
      isActive: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search Bar - Always Visible */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors text-black placeholder:text-gray-400"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filter Header with Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className="text-lg font-semibold text-black">Filters</h3>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-black hover:text-red-600 transition-colors"
                disabled={isLoading}
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm text-black hover:text-indigo-800 transition-colors"
              disabled={isLoading}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
              <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Basic Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Category Select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full rounded-lg border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors text-black"
              disabled={isLoading}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="text-black">{cat}</option>
              ))}
            </select>
          </div>

          {/* Condition Select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="w-full rounded-lg border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors text-black"
              disabled={isLoading}
            >
              <option value="">Any Condition</option>
              {conditions.map(cond => (
                <option key={cond} value={cond} className="text-black">{cond}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-black">Price Range</label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full pl-8 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors text-black placeholder:text-gray-400"
                  disabled={isLoading}
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full pl-8 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors text-black placeholder:text-gray-400"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className={`mt-6 space-y-6 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seller ID */}
              <div>
                <label htmlFor="sellerId" className="block text-sm font-medium text-black mb-1">
                  Seller ID
                </label>
                <input
                  type="text"
                  id="sellerId"
                  placeholder="Enter seller ID..."
                  value={filters.sellerId}
                  onChange={(e) => handleFilterChange('sellerId', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-black"
                  disabled={isLoading}
                />
              </div>

              {/* Active Status */}
              <div>
                <label htmlFor="isActive" className="block text-sm font-medium text-black mb-1">
                  Status
                </label>
                <select
                  id="isActive"
                  value={filters.isActive}
                  onChange={(e) => handleFilterChange('isActive', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-black bg-white"
                  disabled={isLoading}
                >
                  <option value="" className="text-black">All Products</option>
                  <option value="true" className="text-black">Active Only</option>
                  <option value="false" className="text-black">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-black">Active Filters:</span>
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700"
                  >
                    {key}: {value}
                    <button
                      onClick={() => handleFilterChange(key as keyof FilterValues, '')}
                      className="ml-2 hover:text-indigo-900"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}