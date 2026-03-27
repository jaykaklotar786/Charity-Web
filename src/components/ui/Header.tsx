// components/Header.tsx
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import DonateModal from '@/components/DonateModal';
import { isAdmin } from '@/lib/adminCheck';

// Define navigation items type
interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDonate, setShowDonate] = useState<boolean>(false);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);

  const pathname = usePathname();

  // Regular navigation items (visible to everyone)
  const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/causes', label: 'Our Work' },
    { href: '/stories', label: 'Stories' },
    { href: '/contact', label: 'Contact' },
  ];

  // Admin navigation item (only visible to admin)
  const adminNavItem: NavItem = {
    href: '/admin/users',
    label: 'Admin Panel',
    adminOnly: true,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser: User | null) => {
        setUser(currentUser);
        setLoading(false);

        // Check if user is admin
        if (currentUser) {
          const adminStatus = await isAdmin(currentUser.uid);
          setIsAdminUser(adminStatus);
        } else {
          setIsAdminUser(false);
        }
      },
    );

    return () => unsubscribe();
  }, []);

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
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
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex mr-9 items-center font-semibold h-full">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 h-full flex items-center duration-300 hover:text-[#7FBF2F] 
                  ${pathname === item.href ? 'text-[#7FBF2F]' : 'text-white'}`}
              >
                {item.label}
              </Link>
            ))}

            {/* Admin Link - Only visible to admin users */}
            {!loading && isAdminUser && (
              <Link
                href="/admin/users"
                className={`px-4 h-full flex items-center gap-2 duration-300 hover:text-[#7FBF2F] 
                  ${pathname?.startsWith('/admin') ? 'text-[#7FBF2F]' : 'text-white'}`}
              >
                <Shield size={16} />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex gap-4">
            {loading ? null : user ? (
              <>
                <Button
                  onClick={() => setShowDonate(true)}
                  className="bg-white text-[#2C3A04] text-[18px] px-6 py-4.5 rounded-b-sm font-semibold transition-all duration-300 hover:bg-[#7FBF2F] hover:text-[#2C3A04] w-[111.66px] h-13.5"
                >
                  Donate
                </Button>

                <button
                  onClick={handleSignOut}
                  className="bg-[#7CB518] text-white px-4 py-2 rounded hover:bg-[#6a9e14] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <button className="bg-[#7CB518] px-4 py-2 rounded hover:bg-[#6a9e14] transition-colors text-white">
                    Sign In
                  </button>
                </Link>

                <Link href="/signup">
                  <button className="bg-[#7CB518] text-white px-4 py-2 rounded hover:bg-[#6a9e14] transition-colors">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-11 h-11 border border-white/70 rounded-[10px] flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white text-black px-5 py-6 shadow-lg">
            <nav className="flex flex-col space-y-4 font-semibold">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`py-2 hover:text-[#7FBF2F] transition-colors ${
                    pathname === item.href ? 'text-[#7FBF2F]' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Admin Link in Mobile Menu */}
              {!loading && isAdminUser && (
                <Link
                  href="/admin/users"
                  onClick={() => setIsMenuOpen(false)}
                  className={`py-2 flex items-center gap-2 hover:text-[#7FBF2F] transition-colors ${
                    pathname?.startsWith('/admin')
                      ? 'text-[#7FBF2F]'
                      : 'text-gray-700'
                  }`}
                >
                  <Shield size={16} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
    </>
  );
}
