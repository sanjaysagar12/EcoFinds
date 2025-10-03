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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
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


  // Upload a single image file to backend S3 endpoint
  const uploadImageFile = async (file: File): Promise<string | null> => {
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('http://localhost:3000/s3/image', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (res.ok && data?.data?.imageUrl) {
        return data.data.imageUrl;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Add selected files as additional images (upload to backend, store URLs)
  const handleAdditionalImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImageFile(files[i]);
      if (url) urls.push(url);
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...urls],
    }));
    setUploadingImages(false);
  };

  // Add image by URL (optional, legacy)
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

      // Prepare FormData for multipart/form-data
      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('category', formData.category);
      form.append('description', formData.description.trim());
      form.append('price', formData.price);
      form.append('quantity', formData.quantity);
      form.append('condition', formData.condition);
      form.append('originalPackaging', String(formData.originalPackaging));
      form.append('manualIncluded', String(formData.manualIncluded));
      form.append('isActive', String(formData.isActive));

      if (formData.yearOfManufacture) {
        form.append('yearOfManufacture', formData.yearOfManufacture);
      }
      if (formData.brand.trim()) {
        form.append('brand', formData.brand.trim());
      }
      if (formData.model.trim()) {
        form.append('model', formData.model.trim());
      }
      if (formData.dimensionLength) {
        form.append('dimensionLength', formData.dimensionLength);
      }
      if (formData.dimensionWidth) {
        form.append('dimensionWidth', formData.dimensionWidth);
      }
      if (formData.dimensionHeight) {
        form.append('dimensionHeight', formData.dimensionHeight);
      }
      if (formData.weight) {
        form.append('weight', formData.weight);
      }
      if (formData.material.trim()) {
        form.append('material', formData.material.trim());
      }
      if (formData.color.trim()) {
        form.append('color', formData.color.trim());
      }
      if (formData.workingConditionDesc.trim()) {
        form.append('workingConditionDesc', formData.workingConditionDesc.trim());
      }
      if (formData.stock) {
        form.append('stock', formData.stock);
      }
      // Add images as JSON string (for future multi-image support)
      if (formData.images.length > 0) {
        form.append('images', JSON.stringify(formData.images));
      }
      // Add thumbnail file if present
      if (thumbnailFile) {
        form.append('image', thumbnailFile);
      }

      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create product');
      }

      setSuccess('Product created successfully!');
      setFormData(initialFormData);
      setThumbnailFile(null);
      // Redirect to the created product or products list after a delay
      setTimeout(() => {
        router.push('/profile');
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
              <p className="text-gray-600 mt-1">List your item on our sustainable marketplace</p>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-gray-700">New Listing</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {success}
              </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Enter a descriptive title for your product"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-500">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="text-gray-900">{cat}</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Provide a detailed description of your product, including condition, features, and any other relevant information"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Enter price (e.g., 29.99)"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Available quantity"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-500">Select condition</option>
                    {conditions.map(cond => (
                      <option key={cond} value={cond} className="text-gray-900">{cond}</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Available stock quantity"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Enter product brand (e.g., Apple, Samsung)"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Enter product model number"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder={`Year (e.g., ${new Date().getFullYear()})`}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Enter product color (e.g., Black, Silver, Blue)"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Length in cm (e.g., 15.5)"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Width in cm (e.g., 10.0)"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Height in cm (e.g., 5.0)"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="Describe the working condition, any defects, wear marks, or issues (e.g., Minor scratches on back, all functions working properly)"
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
                    Thumbnail Image (Upload)
                  </label>
                  <input
                    type="file"
                    id="thumbnail"
                    name="thumbnail"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setThumbnailFile(e.target.files[0]);
                        // Optionally, show preview
                        setFormData(prev => ({ ...prev, thumbnail: URL.createObjectURL(e.target.files![0]) }));
                      } else {
                        setThumbnailFile(null);
                        setFormData(prev => ({ ...prev, thumbnail: '' }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                  {formData.thumbnail && (
                    <img src={formData.thumbnail} alt="Thumbnail Preview" className="mt-2 h-24 rounded border" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images (Upload or URL)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handleAdditionalImages(e.target.files)}
                    className="mb-2"
                  />
                  {uploadingImages && (
                    <div className="text-sm text-blue-600 mb-2">Uploading images...</div>
                  )}
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="url"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                      placeholder="Additional image URL (e.g., https://example.com/image2.jpg)"
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
                          <span className="text-sm text-gray-700 truncate flex-1">
                            {img.startsWith('http') ? (
                              <a href={img} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{img}</a>
                            ) : img}
                          </span>
                          {img.startsWith('http') && (
                            <img src={img} alt="Preview" className="h-10 w-10 object-cover rounded ml-2 border" />
                          )}
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
            <div className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}