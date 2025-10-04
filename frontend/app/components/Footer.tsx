"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white py-16 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-1">
            <h1 className="text-2xl font-semibold italic mb-4">EcoFinds</h1>
            <p className="text-gray-600 text-sm mb-4">
              Sign up for exclusive offers and updates
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter Email Address"
                className="flex-1 px-4 py-2 bg-white rounded-l border border-gray-200 text-sm focus:outline-none"
              />
              <button className="px-4 py-2 bg-gray-100 rounded-r border border-l-0 border-gray-200">
                →
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-4">About</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-800">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-800">
                  Terms And Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-800">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/best-sellers" className="text-gray-600 hover:text-gray-800">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-gray-600 hover:text-gray-800">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-gray-600 hover:text-gray-800">
                  Locations
                </Link>
              </li>
              <li>
                <Link href="/special-offers" className="text-gray-600 hover:text-gray-800">
                  Special Offers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/return-policy" className="text-gray-600 hover:text-gray-800">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-gray-800">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-800">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-4">Social</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/instagram" className="text-gray-600 hover:text-gray-800">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="/facebook" className="text-gray-600 hover:text-gray-800">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="/youtube" className="text-gray-600 hover:text-gray-800">
                  Youtube
                </Link>
              </li>
              <li>
                <Link href="/pinterest" className="text-gray-600 hover:text-gray-800">
                  Pinterest
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
