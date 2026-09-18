import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-white text-slate-700">
      {/* main footer */}
      <div className="relative overflow-hidden">
        <div className="relative mx-auto px-5 py-12 sm:px-6 lg:py-14 md:px-20">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            {/* brand */}
            <div className="lg:col-span-2">
              <Link to="/" className="group inline-flex items-center gap-1">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden">
                  <img src="/logo1.jpeg" alt="SajiloKinmel" className="h-full w-full object-contain" />
                </div>

                <span className="text-xl font-bold tracking-tight text-foreground">
                  Sajilo<span className="text-gradient">Kinmel</span>
                </span>
              </Link>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
                Your everyday grocery destination for fresh fruits and vegetables, quality pantry essentials, snacks, beverages, dairy products, household necessities, and everything you need for a well-stocked home — delivered conveniently to your doorstep.
              </p>

              {/* social icons */}
              <div className="mt-6 flex items-center gap-2.5">
                {[
                  { Icon: FaFacebook, label: "Facebook", color: "text-[#1877F2]", hover: "hover:bg-[#1877F2]" },
                  { Icon: FaInstagram, label: "Instagram", color: "text-[#E4405F]", hover: "hover:bg-[#E4405F]" },
                  { Icon: FaWhatsapp, label: "WhatsApp", color: "text-[#25D366]", hover: "hover:bg-[#25D366]" },
                  { Icon: FaTiktok, label: "TikTok", color: "text-[#000000]", hover: "hover:bg-black" },
                ].map(({ Icon, label, color, hover }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className={`group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white ${color} ${hover} transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:text-white hover:shadow-lg`}
                  >
                    <Icon size={17} className="transition-transform duration-300 group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </div>

            {/* shop */}
            <div>
              <h4 className="mb-5 text-sm font-bold text-slate-900">Shop</h4>

              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/" className="group inline-flex items-center gap-1 text-slate-700 transition-colors hover:text-emerald-600">
                    All Categories
                    <ArrowUpRight size={13} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>

                <li>
                  <Link to="/search" className="group inline-flex items-center gap-1 text-slate-700 transition-colors hover:text-emerald-600">
                    Best Sellers
                    <ArrowUpRight size={13} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* account */}
            <div>
              <h4 className="mb-5 text-sm font-bold text-slate-900">Account</h4>

              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/orders" className="group inline-flex items-center gap-1 text-slate-700 transition-colors hover:text-emerald-600">
                    Track Orders
                    <ArrowUpRight size={13} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>

                <li>
                  <Link to="/wishlist" className="group inline-flex items-center gap-1 text-slate-700 transition-colors hover:text-emerald-600">
                    Wishlist
                    <ArrowUpRight size={13} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>

                <li>
                  <Link to="/become-seller" className="group inline-flex items-center gap-1 text-slate-700 transition-colors hover:text-emerald-600">
                    Sell on SajiloKinmel
                    <ArrowUpRight size={13} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>

                <li>
                  <Link to="/chat" className="group inline-flex items-center gap-1 text-slate-700 transition-colors hover:text-emerald-600">
                    Messages
                    <ArrowUpRight size={13} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* contact */}
            <div>
              <h4 className="mb-5 text-sm font-bold text-slate-900">Get in touch</h4>

              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <MapPin size={15} />
                  </span>
                  <span className="pt-1 text-slate-700">Biratnagar, Nepal</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Phone size={15} />
                  </span>
                  <span className="pt-1 text-slate-700">+977 9817841340</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Mail size={15} />
                  </span>
                  <span className="break-all pt-1 text-slate-700">sajilokinmel@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-emerald-100 bg-emerald-50/50">
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-4 sm:px-6 md:flex-row">
          <p className="text-xs text-slate-700">
            © {new Date().getFullYear()} <span className="font-semibold text-emerald-700">SajiloKinmel</span>. All rights reserved.
          </p>

          <p className="text-xs text-slate-700">
            Designed & developed by <span className="font-semibold text-slate-900">Muna, Seema & Abhisek</span>
          </p>
        </div>
      </div>
    </footer>
  );
}