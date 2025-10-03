"use client";
import { API } from '@/lib/apt';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";

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

const navItems = [
  {
    title: "Shop",
    children: [
      { title: "Best Sellers", url: "/products" },
    ],
  },
  { title: "About", url: "/about" },
  { title: "Support", url: "/support" },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navbar state for mobile menu and search
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
  const res = await fetch(API.PRODUCTS);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.log(err);
        setError("Could not load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSearch && !target.closest("form")) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);

  return (
    <div className="bg-white">
      {/* Top Bar */}
      <div className="bg-white text-gray-700 text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          FREE DELIVERY in INDIA for online payments
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Side */}
            <div className="flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4 ml-4">
                {navItems.map((item) => (
                  <div key={item.title} className="relative group">
                    {item.children ? (
                      <>
                        <button
                          className={`
                            px-3 py-2 rounded-md text-sm font-medium
                            transition-colors duration-200
                            text-gray-700 hover:text-gray-900
                          `}
                        >
                          {item.title}
                        </button>
                        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          <div className="py-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.title}
                                href={child.url}
                                className={`
                                  block px-4 py-2 text-sm
                                  text-gray-700 hover:bg-gray-100
                                `}
                              >
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.url || "#"}
                        className={`
                          px-3 py-2 rounded-md text-sm font-medium
                          transition-colors duration-200
                          text-gray-700 hover:text-gray-900
                        `}
                      >
                        {item.title}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Center - Logo */}
            <Link
              href="/"
              className="absolute left-1/2 transform -translate-x-1/2"
            >
              <h1 className="text-2xl text-black font-semibold italic flex items-center gap-2">
                EcoFinds
              </h1>
            </Link>

            {/* Right Side - Icons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                href="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
              </Link>
              <Link
                href="/profile"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <div key={item.title} className="relative">
                  {item.children ? (
                    <div className="space-y-1">
                      <button
                        className={`
                          w-full text-left px-3 py-2 rounded-md text-base font-medium
                          text-gray-700 hover:text-gray-900 hover:bg-gray-50
                        `}
                      >
                        {item.title}
                      </button>
                      <div className="pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.title}
                            href={child.url}
                            className={`
                              block px-3 py-2 rounded-md text-base font-medium
                              text-gray-700 hover:text-gray-900 hover:bg-gray-50
                            `}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.url || "#"}
                      className={`
                        block px-3 py-2 rounded-md text-base font-medium
                        text-gray-700 hover:text-gray-900 hover:bg-gray-50
                      `}
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Overlay */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg p-4 border-t">
            <form onSubmit={handleSearch}>
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearch(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </nav>

      {/* Hero Banner */}
      <div className="hidden md:block w-full h-screen relative">
        <div className="relative w-full h-full">
          <Image
            src="/homepage/hero.svg"
            alt="Summer Sale Banner"
            className="object-cover"
            fill
            priority
          />
        </div>
      </div>
      <div className="block md:hidden">
        <Image
          src="/homepage/hero.svg"
          alt="Summer Sale Banner"
          width={1920}
          height={1080}
          priority
        />
      </div>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-4xl font-medium text-gray-900">Best Sellers</h2>
          <Link
            href="/shop-all"
            className="text-sm text-gray-600 hover:underline flex items-center gap-1"
          >
            SHOP ALL →
          </Link>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Loading products...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((prod) => {
              // Ensure price is a number for toFixed
              const price = typeof prod.price === "number" ? prod.price : Number(prod.price) || 0;
              return (
                <Link
                  key={prod.id}
                  href={`/product/${prod.id}`}
                  className="group cursor-pointer"
                >
                  <div className="flex flex-col space-y-2">
                    <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden rounded-md">
                      <Image
                        src={prod.thumbnail || "/images/placeholder.png"}
                        alt={prod.title}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        fill
                        sizes="(max-width: 768px) 40vw, 25vw"
                      />
                    </div>
                    <div className="flex flex-col items-center space-y-1.5">
                      <h3 className="text-xs text-gray-700 text-center font-normal line-clamp-2">
                        {prod.title}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 line-through text-xs">
                          ₹{(price * 1.2).toFixed(2)}
                        </span>
                        <span className="text-gray-900 text-xs font-medium">
                          ₹{price.toFixed(2)}
                        </span>
                      </div>
                      <button className="mt-2 w-full bg-indigo-100 text-indigo-600 font-medium py-2 rounded-lg hover:bg-indigo-200 transition">
                        Add to basket
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Banner Sections */}
      <section className="w-full bg-white p-0 m-0">
        <Link href="/collections/athleisure">
          <div className="relative w-full h-[60vh] overflow-hidden rounded-none p-0 m-0">
            <Image
              src="/homepage/banner/banner1.svg"
              alt="Athleisure Collection"
              className="object-cover"
              fill
            />
          </div>
        </Link>
      </section>
      <section className="w-full bg-white p-0 m-0">
        <Link href="/collections/athleisure">
          <div className="relative w-full h-[60vh] overflow-hidden rounded-none p-0 m-0">
            <Image
              src="/homepage/banner/banner2.svg"
              alt="Athleisure Collection"
              className="object-cover"
              fill
            />
          </div>
        </Link>
      </section>
      <section className="w-full bg-white p-0 m-0">
        <Link href="/collections/athleisure">
          <div className="relative w-full h-[60vh] overflow-hidden rounded-none p-0 m-0">
            <Image
              src="/homepage/banner/banner3.svg"
              alt="Athleisure Collection"
              className="object-cover"
              fill
            />
          </div>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 px-10 mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Newsletter Section */}
            <div className="md:col-span-1">
              <h1 className="text-2xl font-semibold italic mb-6">EcoFinds</h1>
              <h3 className="text-gray-700 font-medium mb-2">
                Sign up for exclusive offers and updates
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Get the latest news and updates from our team.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  className="flex-1 px-4 py-2 bg-white rounded-l border-0 focus:outline-none text-sm"
                />
                <button className="px-4 py-2 bg-white rounded-r border-l border-gray-200">
                  →
                </button>
              </div>
            </div>
            {/* About Column */}
            <div className="md:col-span-1">
              <h3 className="font-medium text-gray-700 mb-4">About</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about-us" className="text-gray-600 hover:text-gray-800 text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-gray-800 text-sm">
                    Terms And Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-gray-800 text-sm">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            {/* Shop Column */}
            <div className="md:col-span-1">
              <h3 className="font-medium text-gray-700 mb-4">Shop</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/best-sellers" className="text-gray-600 hover:text-gray-800 text-sm">
                    Best Sellers
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="text-gray-600 hover:text-gray-800 text-sm">
                    Collections
                  </Link>
                </li>
                <li>
                  <Link href="/locations" className="text-gray-600 hover:text-gray-800 text-sm">
                    Locations
                  </Link>
                </li>
                <li>
                  <Link href="/special-offers" className="text-gray-600 hover:text-gray-800 text-sm">
                    Special Offers
                  </Link>
                </li>
              </ul>
            </div>
            {/* Support Column */}
            <div className="md:col-span-1">
              <h3 className="font-medium text-gray-700 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/return-policy" className="text-gray-600 hover:text-gray-800 text-sm">
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-600 hover:text-gray-800 text-sm">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-gray-800 text-sm">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            {/* Social Column */}
            <div className="md:col-span-1">
              <h3 className="font-medium text-gray-700 mb-4">Social</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/instagram" className="text-gray-600 hover:text-gray-800 text-sm">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="/facebook" className="text-gray-600 hover:text-gray-800 text-sm">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="/youtube" className="text-gray-600 hover:text-gray-800 text-sm">
                    Youtube
                  </Link>
                </li>
                <li>
                  <Link href="/pinterest" className="text-gray-600 hover:text-gray-800 text-sm">
                    Pinterest
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}