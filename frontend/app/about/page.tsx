"use client";
import { Corinthia } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
const corinthia = Corinthia({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Full-width navbar like landing page */}
      <Navbar />

      {/* Full-width Banner (moved out of the constrained container) */}
      <div className="w-full">
        <div className="relative w-full h-[300px] mb-12">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/about/hero.svg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <h1
                className={`${corinthia.className} text-6xl text-black text-center`}
              >
                About us
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main constrained content */}
      <main className="max-w-7xl mx-auto px-4 text-black">
        {/* Our Story Section */}
        <div className="px-0 mb-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Left side - Illustration */}
              <div className="w-full md:w-1/2">
                <Image
                  src="/about/img1.svg"
                  alt="Sustainable Fashion Illustration"
                  className="w-full h-auto"
                  width={800}
                  height={600}
                  priority
                />
              </div>

              {/* Right side - Content */}
              <div className="w-full md:w-1/2">
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src="/about/img1.svg"
                    alt="About Icon"
                    className="w-6 h-6"
                    width={24}
                    height={24}
                    priority
                  />
                  <span className="text-gray-600">About Us</span>
                </div>

                <h2 className="text-4xl font-bold mb-4">
                  Our{" "}
                  <span className={`${corinthia.className} text-5xl`}>Story</span>
                </h2>

                <p className="mb-6 leading-relaxed text-black">
                  Fashion can be both beautiful and responsible. Frustrated by the
                  waste and harm caused by fast fashion, we set out to create a
                  platform where style meets sustainability. From day one, we've
                  worked with eco-conscious brands that share our vision of a
                  greener, fairer world. Our journey is rooted in a passion for
                  making a difference—not just through the clothes we offer, but
                  through the communities we build.
                </p>

                <button className="bg-[#4A5043] text-white px-6 py-3 rounded hover:bg-opacity-90 transition-colors">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="mb-24 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Left side - Content */}
              <div className="w-full md:w-1/2">
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src="/about/img2.svg"
                    alt="About Icon"
                    className="w-6 h-6"
                    width={24}
                    height={24}
                    priority
                  />
                  <span className="text-gray-600">Our Mission & Vision</span>
                </div>

                <h2 className="text-4xl font-bold mb-4">
                  Fashion For A<br />
                  <span className={`${corinthia.className} text-5xl`}>Greener</span>{" "}
                  Future.
                </h2>

                <p className="mb-6 leading-relaxed border-l-4 border-[#565B47] ps-2 text-black">
                  Our mission is to revolutionize the fashion industry by offering
                  stylish, sustainable, and ethically-produced clothing, creating
                  a community of conscious consumers who value both quality and
                  the planet. We are committed to reducing the environmental
                  impact of fashion while promoting fair labor standards,
                  empowering individuals to make choices that support eco-friendly
                  practices.
                </p>

                <button className="bg-[#4A5043] text-white px-6 py-3 rounded hover:bg-opacity-90 transition-colors">
                  Check Now
                </button>
              </div>

              {/* Right side - Illustration */}
              <div className="w-full md:w-1/2">
                <Image
                  src="/about/img2.svg"
                  alt="About Icon"
                  className="w-full h-auto"
                  width={800}
                  height={600}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Re-center Section */}
        <div className="py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Left side - Illustration */}
              <div className="w-full md:w-1/2">
                <div className="relative">
                  <div className="relative">
                    <Image
                      src="/about/img1.svg"
                      alt="About Icon"
                      className="w-full h-auto"
                      width={800}
                      height={600}
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Right side - Content */}
              <div className="w-full md:w-1/2">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-[#4A5043] flex items-center justify-center">
                      <Image
                        src="/about/img1.svg"
                        alt="About Icon"
                        className="w-full h-auto"
                        width={20}
                        height={20}
                        priority
                      />
                    </div>
                    <span className="text-gray-600">Our Team</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-4xl font-bold">Your Allies in</h2>
                    <h2 className={`${corinthia.className} text-5xl`}>
                      Sustainable Fashion.
                    </h2>
                  </div>

                  <p className="leading-relaxed text-black">
                    We at Prixsy strive to offer stylish clothing that doesn't
                    compromise the planet. Every purchase supports fair labor,
                    sustainable materials, and environmentally conscious
                    production methods. Together, we can redefine fashion by
                    making choices that are both chic and responsible.
                  </p>

                  <a
                    href="/shop"
                    className="inline-block bg-[#4A5043] text-white px-6 py-3 rounded hover:bg-opacity-90 transition-colors"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full-width footer like landing page */}
      <Footer />
    </div>
  );
};

export default AboutPage;
