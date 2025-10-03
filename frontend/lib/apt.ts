// apt.ts
// Centralized API endpoints for EcoFinds frontend
// Loads base backend URL from environment variable

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const API = {
  // Auth
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,
  GOOGLE_SIGNIN: `${BASE_URL}/api/auth/google/signin`,
  GOOGLE_CALLBACK: `${BASE_URL}/api/auth/google/callback`,

  // User
  USER_ME: `${BASE_URL}/api/user/me`,
  USER_PROFILE: `${BASE_URL}/api/user/profile`,

  // Address
  ADDRESS: `${BASE_URL}/api/address`, // GET (all), POST (create)
  ADDRESS_DETAIL: (id: string) => `${BASE_URL}/api/address/${id}`,

  // Product
  PRODUCTS: `${BASE_URL}/api/products`, // GET (all), POST (create)
  PRODUCT_DETAIL: (id: string) => `${BASE_URL}/api/products/${id}`,
  MY_PRODUCTS: `${BASE_URL}/api/products/my-products`,
  PRODUCTS_BY_USER: (userId: string) => `${BASE_URL}/api/products/by-user/${userId}`,

  // Cart
  CART: `${BASE_URL}/api/cart`, // GET, POST, DELETE (clear)
  CART_ITEM: (id: string) => `${BASE_URL}/api/cart/${id}`,

  // Order
  ORDERS: `${BASE_URL}/api/orders`, // GET (all), POST (create)
  ORDER_DETAIL: (id: string) => `${BASE_URL}/api/orders/${id}`,
  ORDER_STATUS: (id: string) => `${BASE_URL}/api/orders/${id}/status`,

  // S3 (file upload)
  S3_IMAGE_UPLOAD: `${BASE_URL}/api/s3/image`,
  S3_IMAGE: (fileName: string) => `${BASE_URL}/api/s3/images/${fileName}`,
};
