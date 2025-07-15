// components/Hero.tsx
'use client';

//searchBar
import SearchInput from '../search/SearchBar';
import Header from './Header';
import { useState } from 'react';

const tabs = ['Buy', 'Rent', 'Sell', 'By Owner'];

export default function Hero() {
  const [activeTab, setActiveTab] = useState('Buy');

  return (
    <section
      className="relative w-full h-[550px] sm:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center justify-center px-4 sm:px-6 lg:px-20"
      style={{ backgroundImage: "url('/HeroBeachHome.jpg')" }}
    >
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/70 z-0" />

      {/* Header */}
      <div className='absolute top-0 left-0 w-full z-10'>
        <Header/>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-xl w-full mt-8 sm:mt-0">
        {/* Headline */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
          Find your perfect home by the sea in Rosarito
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6"></p>

        {/* Tabs - Mobile optimized */}
        <div className="flex  sm:justify-start flex-wrap gap-1 sm:gap-[3px] mb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-t border-t transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-blue-600 font-semibold'
                  : 'bg-black/30 text-white transition duration-300 hover:bg-white hover:text-blue-600 hover:shadow-[0_0_10px_2px_rgba(59,130,246,0.7)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Container */}
        <div className='bg-white rounded-b-lg shadow-lg overflow-hidden'>
          <SearchInput
            placeholder={`Search ${activeTab.toLowerCase()} listings...`}
            onSearch={(val) => console.log("Search:", val)}
            onClear={() => console.log("Cleared")}
          />
        </div>
      </div>
    </section>
  );
}