'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormData {
  title: string;
  category: string;
  description: string;
  price: string;
  quantity: string;
  condition: string;
  yearOfManufacture: string;
  brand: string;
  model: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  weight: string;
  material: string;
  color: string;
  originalPackaging: boolean;
  manualIncluded: boolean;
  workingConditionDesc: string;
  thumbnail: string;
  images: string[];
  stock: string;
  isActive: boolean;
}

const initialFormData: ProductFormData = {
  title: '',
  category: '',
  description: '',
  price: '',
  quantity: '1',
  condition: '',
  yearOfManufacture: '',
  brand: '',
  model: '',
  dimensionLength: '',
  dimensionWidth: '',
  dimensionHeight: '',
  weight: '',
  material: '',
  color: '',
  originalPackaging: false,
  manualIncluded: false,
  workingConditionDesc: '',
  thumbnail: '',
  images: [],
  stock: '0',
  isActive: true,
};

const categories = [
  'Electronics',
  'Books',
  'Clothing',
  'Home',
  'Sports',
  'Automotive',
  'Beauty',
  'Toys',
  'Music',
  'Art',
  'Other'
];

const conditions = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Poor',
  'Refurbished'
];

export default function CreateProductPage() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [imageInput, setImageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('Valid price is required');
      return false;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      setError('Quantity must be at least 1');
      return false;
    }
    if (!formData.condition) {
      setError('Condition is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Prepare data for API
      const productData: any = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        condition: formData.condition,
        originalPackaging: formData.originalPackaging,
        manualIncluded: formData.manualIncluded,
        isActive: formData.isActive,
      };

      // Add optional fields only if they have values
      if (formData.yearOfManufacture) {
        productData.yearOfManufacture = parseInt(formData.yearOfManufacture);
      }
      if (formData.brand.trim()) {
        productData.brand = formData.brand.trim();
      }
      if (formData.model.trim()) {
        productData.model = formData.model.trim();
      }
      if (formData.dimensionLength) {
        productData.dimensionLength = parseFloat(formData.dimensionLength);
      }
      if (formData.dimensionWidth) {
        productData.dimensionWidth = parseFloat(formData.dimensionWidth);
      }
      if (formData.dimensionHeight) {
        productData.dimensionHeight = parseFloat(formData.dimensionHeight);
      }
      if (formData.weight) {
        productData.weight = parseFloat(formData.weight);
      }
      if (formData.material.trim()) {
        productData.material = formData.material.trim();
      }
      if (formData.color.trim()) {
        productData.color = formData.color.trim();
      }
      if (formData.workingConditionDesc.trim()) {
        productData.workingConditionDesc = formData.workingConditionDesc.trim();
      }
      if (formData.thumbnail.trim()) {
        productData.thumbnail = formData.thumbnail.trim();
      }
      if (formData.images.length > 0) {
        productData.images = formData.images;
      }
      if (formData.stock) {
        productData.stock = parseInt(formData.stock);
      }

      // Make API call to create product
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create product');
      }

      setSuccess('Product created successfully!');
      setFormData(initialFormData);
      
      // Redirect to the created product or products list after a delay
      setTimeout(() => {
        router.push('/profile'); // or wherever you want to redirect
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the product');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Product</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter product title"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe your product in detail"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select condition</option>
                    {conditions.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Product brand"
                  />
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Product model"
                  />
                </div>

                <div>
                  <label htmlFor="yearOfManufacture" className="block text-sm font-medium text-gray-700 mb-2">
                    Year of Manufacture
                  </label>
                  <input
                    type="number"
                    id="yearOfManufacture"
                    name="yearOfManufacture"
                    value={formData.yearOfManufacture}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="YYYY"
                  />
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Product color"
                  />
                </div>

                <div>
                  <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    id="material"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Primary material"
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dimensions (cm)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="dimensionLength" className="block text-sm font-medium text-gray-700 mb-2">
                    Length
                  </label>
                  <input
                    type="number"
                    id="dimensionLength"
                    name="dimensionLength"
                    value={formData.dimensionLength}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label htmlFor="dimensionWidth" className="block text-sm font-medium text-gray-700 mb-2">
                    Width
                  </label>
                  <input
                    type="number"
                    id="dimensionWidth"
                    name="dimensionWidth"
                    value={formData.dimensionWidth}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label htmlFor="dimensionHeight" className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="number"
                    id="dimensionHeight"
                    name="dimensionHeight"
                    value={formData.dimensionHeight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="workingConditionDesc" className="block text-sm font-medium text-gray-700 mb-2">
                    Working Condition Description
                  </label>
                  <textarea
                    id="workingConditionDesc"
                    name="workingConditionDesc"
                    value={formData.workingConditionDesc}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe the working condition, any defects, etc."
                  />
                </div>

                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="originalPackaging"
                      checked={formData.originalPackaging}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Original Packaging Included</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="manualIncluded"
                      checked={formData.manualIncluded}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Manual/Instructions Included</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Listing</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="url"
                    id="thumbnail"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700 truncate flex-1">{img}</span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}