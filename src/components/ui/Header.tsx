'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pathname = usePathname();

  return (
    <header className="absolute top-0 left-0 w-full h-25 z-50 text-white">
      <div className="max-w-310 mx-auto px-5 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/site-logo-white.svg"
            alt="Charity Logo"
            width={150}
            height={38}
            className="h-9.5 w-37.5"
          />
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex mr-9 items-center font-semibold h-full">
          <Link
            href="/"
            className={`px-4 h-full w-[77.88px] flex items-center duration-300 hover:text-[#7FBF2F] 
  ${pathname === '/' ? 'text-[#7FBF2F]' : 'text-white'}`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`px-4 h-full w-[103.58px] flex items-center duration-300 hover:text-[#7FBF2F] ${pathname === '/about' ? 'text-[#7FBF2F]' : 'text-white'}`}
          >
            About Us
          </Link>
          <Link
            href="/causes"
            className="px-4 h-full w-[105.69px] flex items-center duration-300 hover:text-[#7FBF2F] ${pathname === '/causes' ? 'text-[#7FBF2F]' : 'text-white'}"
          >
            Our Work
          </Link>
          <Link
            href="/stories"
            className="px-4 h-full w-[87.2px] flex items-center duration-300 hover:text-[#7FBF2F] ${pathname === '/stories' ? 'text-[#7FBF2F]' : 'text-white'}"
          >
            Stories
          </Link>
          <Link
            href="/contact"
            className="px-4 h-full w-[96.3px] flex items-center duration-300 hover:text-[#7FBF2F] ${pathname === '/contact' ? 'text-[#7FBF2F]' : 'text-white'}"
          >
            Contact
          </Link>
        </nav>

        {/* Button */}
        <div className="hidden md:flex items-center">
          <Button className="bg-white text-[#2C3A04] text-[18px] px-6 py-4.5 rounded-b-sm  font-semibold transition-all duration-300 hover:bg-[#7FBF2F] hover:text-[#2C3A04] w-[111.66px] h-13.5">
            Donate
          </Button>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white text-black px-5 py-6">
          <nav className="flex flex-col space-y-4 font-semibold">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)}>
              About Us
            </Link>
            <Link href="/causes" onClick={() => setIsMenuOpen(false)}>
              Our Work
            </Link>
            <Link href="/stories" onClick={() => setIsMenuOpen(false)}>
              Stories
            </Link>
            <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
