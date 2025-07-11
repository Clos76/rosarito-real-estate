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
      className="relative w-full h-[550px] bg-cover bg-center bg-no-repeat text-white flex items-center justify-center px-20"
      style={{ backgroundImage: "url('/HeroBeachHome.jpg')" }}
    >
      
      {/* Overlay - Added inset-0 to make it cover the entire parent */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/70 z-0" />

    
      <div className='absolute top-0 left-0 w-full z-10'>
        <Header/>
      </div>


      <div className="relative z-10 text-center px-4 max-w-xl w-full">
        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl font-bold mb-4">Find your perfect home by the sea in Rosarito</h1>
        <p className="text-lg sm:text-xl mb-6"></p>

        {/* Tabs */}
        <div className="flex justify-start flex-wrap gap-[3px]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t border-t transition-all duration-200 ${activeTab === tab
                  ? 'bg-white text-blue-600 font-semibold'
                  : 'bg-black/30 text-white px-4 py-2 rounded-t transition duration-300 hover:bg-white hover:text-blue-600 hover:shadow-[0_0_10px_2px_rgba(59,130,246,0.7)]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className='bg-white flex flex-wrap'>
          {/* Search box */}
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