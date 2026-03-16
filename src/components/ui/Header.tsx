'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

        {/* Desktop Menu */}
        <nav className="hidden md:flex mr-9 items-center font-semibold h-full">
          <Link
            href="/"
            className={`px-4 h-full flex items-center duration-300 hover:text-[#7FBF2F] 
            ${pathname === '/' ? 'text-[#7FBF2F]' : 'text-white'}`}
          >
            Home
          </Link>

          <Link
            href="/about"
            className={`px-4 h-full flex items-center duration-300 hover:text-[#7FBF2F] 
            ${pathname === '/about' ? 'text-[#7FBF2F]' : 'text-white'}`}
          >
            About Us
          </Link>

          <Link
            href="/causes"
            className={`px-4 h-full flex items-center duration-300 hover:text-[#7FBF2F] 
            ${pathname === '/causes' ? 'text-[#7FBF2F]' : 'text-white'}`}
          >
            Our Work
          </Link>

          <Link
            href="/stories"
            className={`px-4 h-full flex items-center duration-300 hover:text-[#7FBF2F] 
            ${pathname === '/stories' ? 'text-[#7FBF2F]' : 'text-white'}`}
          >
            Stories
          </Link>

          <Link
            href="/contact"
            className={`px-4 h-full flex items-center duration-300 hover:text-[#7FBF2F] 
            ${pathname === '/contact' ? 'text-[#7FBF2F]' : 'text-white'}`}
          >
            Contact
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex gap-4">
          {loading ? null : user ? (
            <>
              <Button className="bg-white text-[#2C3A04] text-[18px] px-6 py-4.5 rounded-b-sm font-semibold transition-all duration-300 hover:bg-[#7FBF2F] hover:text-[#2C3A04] w-[111.66px] h-13.5">
                Donate
              </Button>

              <button
                onClick={() => signOut(auth)}
                className="bg-[#7CB518] text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <button className="bg-[#7CB518] px-4 py-2 rounded">
                  Sign In
                </button>
              </Link>

              <Link href="/signup">
                <button className="bg-[#7CB518] text-white px-4 py-2 rounded">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden w-11 h-11 border border-white/70 rounded-[10px] flex items-center justify-center"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
