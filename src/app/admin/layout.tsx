// app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  X,
  Users,
  Heart,
  DollarSign,
  LogOut,
  Shield,
} from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdmin } from '@/lib/adminCheck';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Navigation items - UPDATE THESE PATHS BASED ON YOUR ACTUAL FOLDER NAMES
  const navItems = [
    { href: '/admin/users', label: 'Users', icon: Users },
    // If your folder is named "Charity" (capital C), use this:
    { href: '/admin/Charity', label: 'Charity', icon: Heart },
    // If your folder is named "Donates" (capital D), use this:
    { href: '/admin/Donates', label: 'Donations', icon: DollarSign },

    // OR if your folders are lowercase, use these instead:
    // { href: '/admin/charity', label: 'Charity', icon: Heart },
    // { href: '/admin/donates', label: 'Donations', icon: DollarSign },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser: User | null) => {
        if (!currentUser) {
          router.push('/signin');
          return;
        }

        const admin = await isAdmin(currentUser.uid);
        if (!admin) {
          router.push('/');
          toast.error('Access denied. Admin only.');
          return;
        }

        setUser(currentUser);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Check if a nav item is active (handle both lowercase and uppercase paths)
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 bg-gradient-to-b from-[#628309] to-[#4a6207] text-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col shadow-xl
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-white/20">
          <Link href="/admin/users" className="block">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-xs text-white/70">Manage your platform</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    active
                      ? 'bg-[#7CB518] text-white shadow-md'
                      : 'text-white/80 hover:bg-[#3d4a22] hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs text-white/70 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <Link href="/admin/users" className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-gray-900">Admin</span>
            </Link>
            <div className="w-10" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
