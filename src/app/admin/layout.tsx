'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/adminCheck';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect } from 'react';

// Define props type
interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) return router.push('/');

      const admin = await isAdmin(user.uid);
      if (!admin) return router.push('/');
    });

    return () => unsub();
  }, [router]);

  const navItems = [
    {
      href: '/admin/users',
      label: 'Users',
      path: '/admin/users',
    },
    {
      href: '/admin/charity',
      label: 'Charity',
      path: '/admin/charity',
    },
    {
      href: '/admin/donations',
      label: 'Donations',
      path: '/admin/donations',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#628309] text-white p-6 flex flex-col">
        <Link href="/" className="mb-10">
          <Image
            src="/Images/site-logo-white-2.svg"
            alt="Logo"
            width={150}
            height={38}
            priority
          />
        </Link>

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`p-2 rounded mb-3 transition-colors duration-200 ${
              pathname === item.path ? 'bg-[#7CB518]' : 'hover:bg-[#3d4a22]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">{children}</div>
    </div>
  );
}
