"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";

const navItems = [
  {
    title: "Shop",
    children: [{ title: "Best Sellers", url: "/product" }],
  },
  { title: "About", url: "/about" },
  { title: "Support", url: "/support" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showSearch && !target.closest("form")) setShowSearch(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(
        searchQuery.trim()
      )}`;
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  return (
    <header>
      <div className="bg-white text-gray-700 text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          FREE DELIVERY in INDIA for online payments
        </div>
      </div>

      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsOpen((s) => !s)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="hidden md:flex items-center space-x-4 ml-4">
                {navItems.map((item) => (
                  <div key={item.title} className="relative group">
                    {item.children ? (
                      <>
                        <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                          {item.title}
                        </button>
                        <div className="absolute left-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <div className="py-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.title}
                                href={child.url}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        {item.title}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-2">
                
                <span className="text-xl font-semibold text-black">EcoFinds</span>
              </div>
            </Link>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full">
                <ShoppingBag className="w-5 h-5" />
              </Link>

              <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full">
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {isOpen && (
            <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <div key={item.title}>
                  {item.children ? (
                    <>
                      <div className="px-3 py-2 rounded-md text-base font-medium text-gray-700">
                        {item.title}
                      </div>
                      <div className="pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.title}
                            href={child.url}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.url || "#"}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showSearch && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg p-4 border-t">
            <form onSubmit={handleSearch}>
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    aria-label="Clear"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </nav>
    </header>
  );
}
