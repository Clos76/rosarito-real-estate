



import React from "react";

type AmenitiesProps = {
    amenities: string[];
};

export default function Amenities ({ amenities }: AmenitiesProps){
    return(
        <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Amenities</h2>
            {amenities && amenities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {amenities.map((amenity, index) => (
                        <div 
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span className="text-gray-800">{amenity}</span>
                        </div>
                    ))}
                </div>
            ):(
                <p className="text-gray-600 italic">
                    No amenities listed for this property
                </p>
            )}
        </section>
    )
}