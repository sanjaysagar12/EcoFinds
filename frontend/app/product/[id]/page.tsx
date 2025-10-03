import { API } from '@/lib/apt';
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  condition: string;
  yearOfManufacture?: number;
  brand?: string;
  model?: string;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  weight?: number;
  material?: string;
  color?: string;
  originalPackaging: boolean;
  manualIncluded: boolean;
  workingConditionDesc?: string;
  thumbnail?: string;
  images: string[];
  stock: number;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

interface ProductResponse {
  status: string;
  message: string;
  data: Product;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    setIsLoading(true);
    setError('');

    try {
  const response = await fetch(API.PRODUCT_DETAIL(productId));

      if (response.ok) {
        const data: ProductResponse = await response.json();
        setProduct(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch product');
      }
    } catch (err) {
      setError('An error occurred while fetching the product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Navigate to checkout with product and quantity
    router.push(`/checkout?productId=${product.id}&quantity=${quantity}`);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setIsAddingToCart(true);
    setError('');

    try {
      const cartData = {
        productId: product.id,
        quantity: quantity,
      };

  const response = await fetch(API.CART, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartData),
      });

      if (response.ok) {
        setCartSuccess(true);
        setTimeout(() => {
          setCartSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add to cart');
      }
    } catch (err) {
      setError('An error occurred while adding to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="h-5 w-5 text-gray-300" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link
            href="/product"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const displayImages = product.images.length > 0 ? product.images : (product.thumbnail ? [product.thumbnail] : []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <nav className="flex mb-4" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/product" className="text-indigo-600 hover:text-indigo-800 font-medium">
                      <svg className="inline mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Products
                    </Link>
                  </li>
                  <li>
                    <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </li>
                  <li>
                    <span className="text-gray-500">{product.category}</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <p className="mt-2 text-sm text-gray-600">
                Listed by {product.seller.name} • {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="text-center sm:text-right">
                <div className="text-2xl font-bold text-indigo-600">₹{product.price.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Messages */}
        {orderSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
            <svg className="mr-2 h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Order placed successfully! Redirecting to your orders...
          </div>
        )}

        {cartSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
            <svg className="mr-2 h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Product added to cart successfully! 
            <Link href="/cart" className="ml-2 underline hover:text-green-900 font-medium">
              View Cart
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {displayImages.length > 0 && displayImages[selectedImage] ? (
                <Image
                  src={displayImages[selectedImage]}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {displayImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {displayImages.filter(image => image).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-indigo-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.condition === 'New' 
                    ? 'bg-green-100 text-green-800'
                    : product.condition === 'Like New'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {product.condition}
                </span>
                <span className="text-sm text-gray-500">{product.category}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              
              {product.brand && (
                <p className="text-lg text-gray-600 mb-2">Brand: {product.brand}</p>
              )}

              {product.model && (
                <p className="text-lg text-gray-600 mb-2">Model: {product.model}</p>
              )}

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {getRatingStars(product.averageRating)}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="text-4xl font-bold text-gray-900 mb-4">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Order Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Array.from({ length: Math.min(product.quantity, 10) }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-500">
                  {product.quantity} available
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.quantity === 0}
                  className="w-full bg-white text-indigo-600 border border-indigo-600 py-3 px-6 rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                      Adding to Cart...
                    </>
                  ) : product.quantity === 0 ? (
                    'Out of Stock'
                  ) : (
                    'Add to Cart'
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOrdering || product.quantity === 0}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isOrdering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </>
                  ) : product.quantity === 0 ? (
                    'Out of Stock'
                  ) : (
                    'Buy Now'
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-3 text-red-600 text-sm">{error}</div>
              )}
            </div>

            {/* Seller Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Sold by</h3>
              <div className="flex items-center space-x-3">
                {product.seller.avatar ? (
                  <Image
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {product.seller.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{product.seller.name}</p>
                  <p className="text-sm text-gray-500">{product.seller.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description and Specifications */}
        <div className="mt-12 space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>

          {/* Working Condition */}
          {product.workingConditionDesc && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Working Condition</h3>
              <p className="text-gray-700">{product.workingConditionDesc}</p>
            </div>
          )}

          {/* Specifications */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.yearOfManufacture && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="font-medium text-gray-500">Year of Manufacture</dt>
                  <dd className="mt-1 text-gray-900">{product.yearOfManufacture}</dd>
                </div>
              )}
              
              {product.material && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="font-medium text-gray-500">Material</dt>
                  <dd className="mt-1 text-gray-900">{product.material}</dd>
                </div>
              )}
              
              {product.color && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="font-medium text-gray-500">Color</dt>
                  <dd className="mt-1 text-gray-900">{product.color}</dd>
                </div>
              )}
              
              {product.weight && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="font-medium text-gray-500">Weight</dt>
                  <dd className="mt-1 text-gray-900">{product.weight} kg</dd>
                </div>
              )}
              
              {(product.dimensionLength || product.dimensionWidth || product.dimensionHeight) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="font-medium text-gray-500">Dimensions (L×W×H)</dt>
                  <dd className="mt-1 text-gray-900">
                    {product.dimensionLength || '?'} × {product.dimensionWidth || '?'} × {product.dimensionHeight || '?'} cm
                  </dd>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="font-medium text-gray-500">Original Packaging</dt>
                <dd className="mt-1 text-gray-900">{product.originalPackaging ? 'Yes' : 'No'}</dd>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="font-medium text-gray-500">Manual Included</dt>
                <dd className="mt-1 text-gray-900">{product.manualIncluded ? 'Yes' : 'No'}</dd>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {product.reviews.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reviews ({product.reviewCount})</h3>
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6">
                    <div className="flex items-start space-x-4">
                      {review.reviewer.avatar ? (
                        <Image
                          src={review.reviewer.avatar}
                          alt={review.reviewer.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {review.reviewer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{review.reviewer.name}</span>
                          <div className="flex items-center">
                            {getRatingStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{formatDate(review.createdAt)}</p>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}