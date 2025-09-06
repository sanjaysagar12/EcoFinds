'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface CartProduct {
  id: string;
  title: string;
  price: number;
  thumbnail: string | null;
  seller: {
    id: string;
    name: string;
  };
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
  subtotal: number;
}

interface CheckoutItem {
  productId: string;
  quantity: number;
  product: CartProduct;
  subtotal: number;
}

interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phoneNumber: '',
  });

  const productId = searchParams.get('productId');
  const quantity = searchParams.get('quantity');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (productId && quantity) {
      // Direct product purchase
      fetchSingleProduct();
    } else {
      // Cart checkout
      fetchCartItems();
    }
  }, [productId, quantity]);

  const fetchSingleProduct = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/api/products/${productId}`);

      if (response.ok) {
        const data = await response.json();
        const product = data.data;
        const qty = parseInt(quantity || '1');
        
        const checkoutItem: CheckoutItem = {
          productId: product.id,
          quantity: qty,
          product: {
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            seller: product.seller,
          },
          subtotal: product.price * qty,
        };

        setItems([checkoutItem]);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch product');
      }
    } catch (err) {
      setError('An error occurred while fetching product');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCartItems = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data.items.length === 0) {
          router.push('/cart');
          return;
        }

        const checkoutItems: CheckoutItem[] = data.data.items.map((item: CartItem) => ({
          productId: item.productId,
          quantity: item.quantity,
          product: item.product,
          subtotal: item.subtotal,
        }));

        setItems(checkoutItems);
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        router.push('/auth/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch cart');
      }
    } catch (err) {
      setError('An error occurred while fetching cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) return;

    // Validate shipping info
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
      setError('Please fill in all required shipping information');
      return;
    }

    setIsPlacingOrder(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingInfo: JSON.stringify(shippingInfo),
      };

      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        // Clear cart if this was a cart checkout
        if (!productId) {
          await fetch('http://localhost:3000/api/cart', {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        // Redirect to orders page
        router.push('/orders');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to place order');
      }
    } catch (err) {
      setError('An error occurred while placing the order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No items to checkout</p>
          <Link
            href="/product"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">
            Review your order and enter shipping information
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
            
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    required
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    required
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    required
                    value={shippingInfo.zipCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="10001"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <select
                    id="country"
                    required
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={shippingInfo.phoneNumber}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phoneNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isPlacingOrder}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </>
                  ) : (
                    `Place Order - ${formatPrice(calculateTotal())}`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product.thumbnail ? (
                      <Image
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Sold by {item.product.seller.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                <span className="text-gray-900">{formatPrice(calculateTotal())}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">Free</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">Calculated at delivery</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-base font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg className="h-5 w-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure Checkout</p>
                  <p className="text-xs text-gray-600">Your payment information is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href={productId ? `/product/${productId}` : '/cart'}
            className="text-indigo-600 hover:text-indigo-500 text-sm"
          >
            ← Back to {productId ? 'Product' : 'Cart'}
          </Link>
        </div>
      </div>
    </div>
  );
}