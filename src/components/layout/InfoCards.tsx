'use client';
import Link from "next/link";
import React from "react";

export default function InfoCards() {
  const cardData = [
    {
      title: "Buy",
      description: "Browse Rosarito, Playas de Tijuana, and Ensenada beachfront homes and condos with expert guidance.",
      buttonText: "Learn More",
      link: "/buy" // this should match your RosaritoBuyPage route
    },
    {
      title: "Finance a Home",
      description: "Get pre-approved and secure financing for properties in Rosarito, Playas de Tijuana, and Ensenada.",
      buttonText: "Get Started",
      link: "/buy"
    },
    {
      title: "Sell",
      description: "Sell your property fast and efficiently in Rosarito, Playas de Tijuana, or Ensenada with our professional support.",
      buttonText: "Start Selling",
      link: "#"
    },
    {
      title: "Rent",
      description: "Search for beachfront rentals in Rosarito, Playas de Tijuana, and Ensenada communities.",
      buttonText: "Find Rentals",
      link: "#"
    },
    {
      title: "For Sale By Owner",
      description: "Sell your property without high commission fees using our FSBO platform.",
      buttonText: "Try FSBO",
      link: "#"
    },
    {
      title: "My Home Value",
      description: "Get a free estimate of your property’s value in Rosarito, Playas de Tijuana, and Ensenada.",
      buttonText: "Free Estimate",
      link: "#"
    }
  ];

  return (
    <div className="w-full bg-gray-100 py-8 px-4 mt-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cardData.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-white text-6xl font-bold opacity-20">{card.title[0]}</div>
              </div>
              <div className="p-6 flex flex-col flex-grow text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{card.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed flex-grow">{card.description}</p>
                <Link href={card.link} className="w-full">
                  <span className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors mt-auto">
                    {card.buttonText}
                  </span>
                </Link>



              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
