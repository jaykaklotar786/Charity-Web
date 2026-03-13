'use client';

import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';
import ScrollToTopButton from './ScrollButton';

export default function Footer() {
  return (
    <footer className="bg-[#ffffff] text-[#1f2b0a] border-t border-gray-300">
      {/* Top Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center md:text-left">
        {/* Logo + Description */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/Images/site-logo.svg"
              alt="Charity Logo"
              className="h-8 w-auto"
              width={100}
              height={40}
            />
          </div>

          <p className="text-[16px] text-[#46512A] leading-relaxed mb-7">
            The power of giving: Support a cause and make a difference through
            charity.
          </p>
        </div>

        {/* About */}
        <div>
          <h4 className="font-semibold mb-4">About Us</h4>
          <ul className="space-y-2 text-[#46512A] text-[16px]">
            <li>Our History</li>
            <li>What We Believe</li>
            <li>Our Programs</li>
            <li>Partners</li>
          </ul>
        </div>

        {/* Ways To Give */}
        <div>
          <h4 className="font-semibold mb-4">Ways To Give</h4>
          <ul className="space-y-2 text-[#46512A] text-[16px]">
            <li>Fundraise</li>
            <li>Planned Giving</li>
            <li>Brand Partnership</li>
            <li>Legacy Giving</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-4">Contact Info</h4>
          <ul className="space-y-2 text-[#46512A] text-[16px]">
            <li>1234 Thornridge Cir. Syracuse, Connecticut 56789</li>
            <li>(406) 555-0121</li>
            <li>mail@example.com</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-300">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 text-center md:text-left">
          <p className="text-sm text-gray-600">
            © 2026 Non–Profit Organization. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Facebook
              size={18}
              className="cursor-pointer hover:text-[#d2d8c0] transition"
            />
            <Twitter
              size={18}
              className="cursor-pointer hover:text-[#d2d8c0] transition"
            />
            <Instagram
              size={18}
              className="cursor-pointer hover:text-[#d2d8c0] transition"
            />
            <Youtube
              size={18}
              className="cursor-pointer hover:text-[#d2d8c0] transition"
            />
            <ScrollToTopButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
