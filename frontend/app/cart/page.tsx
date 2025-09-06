'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface CartProduct {
  id: string;
  title: string;
  price: number;
  thumbnail: string | null;
  stock: number;
  isActive: boolean;
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
  createdAt: string;
  updatedAt: string;
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  count: number;
  createdAt: string;
  updatedAt: string;
}

interface CartResponse {
  statusCode: number;
  message: string;
  data: Cart;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    
    fetchCart();
  }, []);

  const fetchCart = async () => {
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
        const data: CartResponse = await response.json();
        setCart(data.data);
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

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(cartItemId));

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        // Refresh cart after successful update
        await fetchCart();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update cart item');
      }
    } catch (err) {
      setError('An error occurred while updating cart item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const removeCartItem = async (cartItemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId));

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh cart after successful removal
        await fetchCart();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to remove cart item');
      }
    } catch (err) {
      setError('An error occurred while removing cart item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your entire cart?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/cart', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh cart after successful clear
        await fetchCart();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to clear cart');
      }
    } catch (err) {
      setError('An error occurred while clearing cart');
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Navigate to checkout page
    router.push('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">
            {cart ? `${cart.count} item${cart.count !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0V9" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start adding some items to your cart to continue shopping.
            </p>
            <div className="mt-6">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Cart Items</h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Clear Cart
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.thumbnail ? (
                          <Image
                            src={item.product.thumbnail}
                            alt={item.product.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/product/${item.productId}`}
                          className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Sold by {item.product.seller.name}
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatPrice(item.product.price)}
                        </p>
                        {!item.product.isActive && (
                          <p className="text-sm text-red-600">This product is no longer available</p>
                        )}
                        {item.quantity > item.product.stock && (
                          <p className="text-sm text-red-600">
                            Only {item.product.stock} in stock
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          disabled={updatingItems.has(item.id) || item.quantity <= 1}
                          className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                          {updatingItems.has(item.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                          ) : (
                            item.quantity
                          )}
                        </span>

                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          disabled={updatingItems.has(item.id) || item.quantity >= item.product.stock}
                          className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeCartItem(item.id)}
                        disabled={updatingItems.has(item.id)}
                        className="p-2 text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingItems.has(item.id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cart.count} items)</span>
                    <span className="text-gray-900">{formatPrice(cart.total)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">Free</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">Calculated at checkout</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-base font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatPrice(cart.total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cart.items.some(item => !item.product.isActive || item.quantity > item.product.stock)}
                  className="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>

                <Link
                  href="/product"
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 flex items-center justify-center text-sm"
                >
                  Continue Shopping
                </Link>

                {cart.items.some(item => !item.product.isActive || item.quantity > item.product.stock) && (
                  <p className="mt-3 text-xs text-red-600">
                    Please remove unavailable items or adjust quantities before checkout.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}