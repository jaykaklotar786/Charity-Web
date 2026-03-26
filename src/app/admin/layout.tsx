'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import router from 'next/dist/shared/lib/router/router';
import { isAdmin } from '@/lib/adminCheck';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from '@firebase/auth';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/');

      const admin = await isAdmin(user.uid);
      if (!admin) return router.push('/');
    });

    return () => unsub();
  }, []);

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
          />
        </Link>
        <Link
          href="/admin/users"
          className={`p-2 rounded mb-3 ${
            pathname === '/admin/users' ? 'bg-[#7CB518]' : 'hover:bg-[#3d4a22]'
          }`}
        >
          Users
        </Link>
        <Link
          href="/admin/Charity"
          className={`p-2 rounded mb-3 ${
            pathname === '/admin/Charity'
              ? 'bg-[#7CB518]'
              : 'hover:bg-[#3d4a22]'
          }`}
        >
          Charity
        </Link>
        <Link
          href="/admin/Donates"
          className={`p-2 rounded  ${
            pathname === '/admin/Donates'
              ? 'bg-[#7CB518]'
              : 'hover:bg-[#435520]'
          }`}
        >
          Donations
        </Link>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">{children}</div>
    </div>
  );
}
