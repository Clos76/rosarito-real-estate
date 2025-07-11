// components/layout/Header.tsx

'use client';
import Link from 'next/link';
import { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';

export default function Header() {
  const [locale, setLocale] = useState<'en' | 'es'>('en');

  return (
<header className="w-full px-6 py-4 flex items-center justify-between bg-transparent ">
      <div className="text-xl font-bold">
        <Link href="/">Rosarito Resorts</Link>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <Link href="/buy" className="px-3 py-1 font-bold rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-blue-500 hover:shadow-md">Buy</Link>
        <Link href="/rent" className="px-3 py-1 font-bold rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-blue-500 hover:shadow-md">Rent</Link>
        <Link href="/sell" className="px-3 py-1  font-bold rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-blue-500 hover:shadow-md">Sell</Link>
        <Link href="/fsbo" className="px-3 py-1 font-bold  rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-blue-500 hover:shadow-md">FSBO</Link>

        <button
          onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
          className="px-2 py-1 border rounded text-xs"
        >
          {locale === 'en' ? 'ES' : 'EN'}
        </button>

        <Link href="/admin/login">
          <FaUserCircle size={22} className="text-gray-600 hover:text-blue-500" />
        </Link>
      </div>
    </header>
  );
}
