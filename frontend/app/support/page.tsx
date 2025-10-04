"use client";
import { useState } from "react";
import axios from "axios";
import { Corinthia } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
const corinthia = Corinthia({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.post("https://api-pluviyo.turplespace.com/contact", formData);
      setSuccess(true);
      setFormData({ name: "", email: "", number: "", message: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Full-width navbar */}
      <Navbar />

      {/* Full-width Banner */}
      <div className="w-full">
        <div className="relative w-full h-[300px] mb-12">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/support/hero.svg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* white overlay panel so text is black on light background */}
            <div className="absolute inset-0 bg-white bg-opacity-90" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1
                className={`${corinthia.className} text-4xl md:text-6xl text-black text-center leading-relaxed`}
              >
                We&apos;d Love To Hear
                <br />
                From You
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main constrained content */}
      <main className="max-w-7xl mx-auto px-4">
        <div className="px-0 py-6 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column - Contact Information */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-semibold mb-2">
                  Talk To{" "}
                  <span className={`${corinthia.className} text-4xl`}>Us</span>
                </h2>
                <p className="text-black leading-relaxed">
                  Got a question or need assistance? We&apos;re here to help!
                  Whether you have an inquiry, need support, or just want to share
                  your thoughts, feel free to get in touch.
                </p>
                <div className="mt-4 text-xl font-medium">+91 9872325297</div>
              </div>

              <div>
                <h2 className="text-3xl font-semibold mb-2">
                  Email your{" "}
                  <span className={`${corinthia.className} text-4xl`}>
                    queries
                  </span>
                </h2>
                <p className="text-black leading-relaxed">
                  Send us an email and we will respond as soon as possible.
                </p>
                <div className="mt-4 text-xl font-medium">support@prixsy.com</div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div>
              <h1 className="text-4xl font-bold mb-8">Contact Us</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Name *"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors bg-white text-black"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors bg-white text-black"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Number"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors bg-white text-black"
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors resize-none bg-white text-black"
                  />
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                {success && (
                  <div className="text-green-500 text-sm">
                    Thank you for your message. We&apos;ll get back to you soon!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Us An Email"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Full-width footer */}
      <Footer />
    </div>
  );
};

export default ContactPage;
