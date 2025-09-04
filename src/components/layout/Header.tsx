// components/layout/Header.tsx

'use client';
import Link from 'next/link';
import { useState } from 'react';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full px-4 sm:px-6 py-4 bg-transparent relative">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="text-lg sm:text-xl font-bold">
          <Link href="/" onClick={closeMenu}>
            Rosarito Resorts
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <Link href="/#" className="px-3 py-1 font-bold rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-blue-500 hover:shadow-md">
            Buy
          </Link>
          <Link href="/#" className="px-3 py-1 font-bold rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-blue-500 hover:shadow-md">
            Rent
          </Link>
          <Link href="/#" className="px-3 py-1 font-bold rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-blue-500 hover:shadow-md">
            Sell
          </Link>
          <Link href="/#" className="px-3 py-1 font-bold rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-blue-500 hover:shadow-md">
            FSBO
          </Link>

          <button
            onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
            className="px-2 py-1 border rounded text-xs bg-white/80 hover:bg-white"
          >
            {locale === 'en' ? 'ES' : 'EN'}
          </button>

          <Link href="/admin/login">
            <FaUserCircle size={22} className="text-gray-600 hover:text-blue-500" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <button
            onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
            className="px-2 py-1 border rounded text-xs bg-white/80 hover:bg-white"
          >
            {locale === 'en' ? 'ES' : 'EN'}
          </button>
          
          <Link href="/admin/login" onClick={closeMenu}>
            <FaUserCircle size={20} className="text-gray-600 hover:text-blue-500" />
          </Link>

          <button
            onClick={toggleMenu}
            className="p-2 text-white hover:text-blue-300 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute left-0 right-0  backdrop-blur-sm z-50 border-t border-white/20">
          <div className="flex flex-col px-6 space-y-3">
            <Link 
              href="/buy" 
              onClick={closeMenu}
              className="text-white hover:text-blue-300 px-3 rounded-md transition-colors font-medium"
            >
              Buy
            </Link>
            <Link 
              href="/rent" 
              onClick={closeMenu}
              className="text-white hover:text-blue-300 px-3 rounded-md transition-colors font-medium"
            >
              Rent
            </Link>
            <Link 
              href="/sell" 
              onClick={closeMenu}
              className="text-white hover:text-blue-300 px-3 rounded-md transition-colors font-medium"
            >
              Sell
            </Link>
            <Link 
              href="/fsbo" 
              onClick={closeMenu}
              className="text-white hover:text-blue-300 px-3 rounded-md transition-colors font-medium"
            >
              FSBO
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}