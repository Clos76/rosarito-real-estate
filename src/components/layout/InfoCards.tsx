"use client"

export default function InfoCards() {
    const cardData = [
        {
            title: "Buy",
            description: "A real estate agent can provide you with a clear breakdown of costs so that you can avoid surprise expenses.",
            buttonText: "Learn More",
            link: "/why-choose-rr"
        },
        {
            title: "Finance a Home",
            description: "Get preapproved so you're ready to make an offer quickly when you find the right home.",
            buttonText: "Get Started",
            link: "/mortgage"
        },
        {
            title: "Sell",
            description: "No matter what path you take to sell your home, we can help you through the process of successfully closing the sale.",
            buttonText: "Start Selling",
            link: "/sell"
        },
        {
            title: "Rent",
            description: "Search for beachfront condos and homes in beachfront communities.",
            buttonText: "Find Rentals",
            link: "/rent"
        },
        {
            title: "For Sale By Owner",
            description: "Tired of spending thousands in commission when you can do it yourself? Try our new for sale by owner platform.",
            buttonText: "Try FSBO",
            link: "/by-owner"
        },

        {
            title: "My Home Value",
            description: "Tired of spending thousands in commission when you can do it yourself? Try our new for sale by owner platform.",
            buttonText: "Free Estimate",
            link: "/estimate"
        }
    ];

    return (
        <div className="w-full bg-gray-100 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
                    How Can We Help You?
                </h2>

                {/* Grid layout for cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cardData.map((card, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">

                            {/* Image placeholder - you can replace with actual images */}
                            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <div className="text-white text-6xl font-bold opacity-20">
                                    {card.title[0]}
                                </div>
                            </div>

                            {/* Card content */}
                            <div className="p-6 flex flex-col flex-grow text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-3">
                                    {card.title}
                                </h3>
                                <p className="text-gray-600 mb-4 leading-relaxed flex-grow">
                                    {card.description}
                                </p>

                                {/* Button */}
                                <button
                                    onClick={() => window.location.href = card.link}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium mt-auto"
                                >
                                    {card.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}