import React from "react";
import {formatPrice} from "@/lib/utils"
import PropertyLocationMap from "./PropertyLocationMap";

// Overview page section
type PropertyOverviewProps = {
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    propertyType: string;
    yearBuilt: number;
    lat?: number;
    lng?: number;
    address: string;
    formattedAddress?: string;
};

export default function PropertyOverview({
    price,
    beds,
    baths,
    sqft,
    propertyType,
    yearBuilt,
    lat,
    lng,
    address,
    formattedAddress,
}: PropertyOverviewProps) {
    return (
        <section id="overview" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">Price</p>
                                <p className="text-xl font-bold">{formatPrice(price)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Bedrooms</p>
                                <p className="text-xl font-bold">{beds}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Bathrooms</p>
                                <p className="text-xl font-bold">{baths}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Square Feet</p>
                                <p className="text-xl font-bold">{sqft.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Property Type</p>
                                <p className="text-xl font-bold">{propertyType}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Year Built</p>
                                <p className="text-xl font-bold">{yearBuilt}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Property Location Map--// Overview Section - Small map */}
                <div>
                    {lat && lng ? (
                        <PropertyLocationMap
                            onLocationSelect={() => { }} // Read-only mode
                            initialAddress={formattedAddress || address}
                            initialLat={lat}
                            initialLng={lng}
                            readOnly={true}
                            height="256px"
                            zoom={13}
                            showInfoWindow={false} // Hide info window in overview for cleaner look
                        />
                    ) : (
                        <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Map location not available</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
