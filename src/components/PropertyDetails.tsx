import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Property } from "@/app/property/[id]/PropertyInterface"; 
import { formatPrice } from "@/lib/utils";

// Climate Risk Badge Component
const ClimateRiskBadge = ({ factor, label }: { factor: string; label: string }) => {
  const getColorClass = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'minimal': return 'bg-green-100 text-green-800';
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'major': return 'bg-red-100 text-red-800';
      case 'severe': return 'bg-red-200 text-red-900';
      case 'extreme': return 'bg-red-300 text-red-900';
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-green-100 text-green-700';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'very poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-gray-700">{label}:</span>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorClass(factor)}`}>
        {factor}
      </span>
    </div>
  );
};

// Expandable Info Section Component
const InfoSection = ({ title, children, defaultExpanded = false }: { 
  title: string; 
  children: React.ReactNode; 
  defaultExpanded?: boolean; 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

interface PropertyDetailsProps {
  property: Property;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  return (
    <section id="details" className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Property Details</h2>
      
      {/* Building Information */}
      {property.buildingInfo && (
        <InfoSection title="Building Information" defaultExpanded={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {property.buildingInfo.name && (
              <div>
                <span className="font-medium text-gray-700">Building Name: </span>
                <span className="text-gray-600">{property.buildingInfo.name}</span>
              </div>
            )}
            {property.buildingInfo.type && (
              <div>
                <span className="font-medium text-gray-700">Building Type: </span>
                <span className="text-gray-600">{property.buildingInfo.type}</span>
              </div>
            )}
            {property.buildingInfo.totalStories && (
              <div>
                <span className="font-medium text-gray-700">Total Stories: </span>
                <span className="text-gray-600">{property.buildingInfo.totalStories}</span>
              </div>
            )}
            {property.buildingInfo.totalUnits && (
              <div>
                <span className="font-medium text-gray-700">Total Units: </span>
                <span className="text-gray-600">{property.buildingInfo.totalUnits}</span>
              </div>
            )}
          </div>
        </InfoSection>
      )}

      {/* Unit Details */}
      {property.unitDetails && (
        <InfoSection title="Unit Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {property.unitDetails.unitNumber && (
              <div>
                <span className="font-medium text-gray-700">Unit Number: </span>
                <span className="text-gray-600">{property.unitDetails.unitNumber}</span>
              </div>
            )}
            {property.unitDetails.floor && (
              <div>
                <span className="font-medium text-gray-700">Floor: </span>
                <span className="text-gray-600">{property.unitDetails.floor}</span>
              </div>
            )}
            {property.unitDetails.lotSize && (
              <div>
                <span className="font-medium text-gray-700">Lot Size: </span>
                <span className="text-gray-600">{property.unitDetails.lotSize.toLocaleString()} sq ft</span>
              </div>
            )}
            {property.unitDetails.parkingSpaces && (
              <div>
                <span className="font-medium text-gray-700">Parking Spaces: </span>
                <span className="text-gray-600">{property.unitDetails.parkingSpaces}</span>
              </div>
            )}
          </div>
          {property.unitDetails.parkingType && property.unitDetails.parkingType.length > 0 && (
            <div className="mt-4">
              <span className="font-medium text-gray-700">Parking Types: </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {property.unitDetails.parkingType.map((type, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </InfoSection>
      )}

      {/* HOA Information */}
      {property.hoa && (
        <InfoSection title="HOA Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {property.hoa.fee && (
              <div>
                <span className="font-medium text-gray-700">HOA Fee: </span>
                <span className="text-gray-600">${property.hoa.fee.toLocaleString()}</span>
                {property.hoa.frequency && (
                  <span className="text-gray-500"> / {property.hoa.frequency.toLowerCase()}</span>
                )}
              </div>
            )}
          </div>
          {property.hoa.includes && property.hoa.includes.length > 0 && (
            <div className="mt-4">
              <span className="font-medium text-gray-700">HOA Includes: </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {property.hoa.includes.map((item, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </InfoSection>
      )}

      {/* Pet Policy */}
      {property.petPolicy && property.petPolicy.length > 0 && (
        <InfoSection title="Pet Policy">
          <div className="flex flex-wrap gap-2 mt-3">
            {property.petPolicy.map((policy, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {policy}
              </span>
            ))}
          </div>
        </InfoSection>
      )}

      {/* Utilities */}
      {property.utilities && (
        <InfoSection title="Utilities & Services">
          <div className="mt-3">
            {property.utilities.included && property.utilities.included.length > 0 && (
              <div className="mb-4">
                <span className="font-medium text-gray-700">Utilities Included: </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {property.utilities.included.map((utility, index) => (
                    <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                      {utility}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {property.utilities.paidBy && (
              <div>
                <span className="font-medium text-gray-700">Utilities Paid By: </span>
                <span className="text-gray-600">{property.utilities.paidBy}</span>
              </div>
            )}
          </div>
        </InfoSection>
      )}

      {/* Interior Features */}
      {property.interior && (
        <InfoSection title="Interior Features">
          <div className="grid grid-cols-1 gap-3 mt-3">
            {property.interior.flooringTypes && (
              <div>
                <span className="font-medium text-gray-700">Flooring: </span>
                <span className="text-gray-600">{property.interior.flooringTypes}</span>
              </div>
            )}
            {property.interior.kitchenFeatures && (
              <div>
                <span className="font-medium text-gray-700">Kitchen Features: </span>
                <span className="text-gray-600">{property.interior.kitchenFeatures}</span>
              </div>
            )}
            {property.interior.appliancesIncluded && (
              <div>
                <span className="font-medium text-gray-700">Appliances Included: </span>
                <span className="text-gray-600">{property.interior.appliancesIncluded}</span>
              </div>
            )}
            {property.interior.fireplaces && (
              <div>
                <span className="font-medium text-gray-700">Fireplaces: </span>
                <span className="text-gray-600">{property.interior.fireplaces}</span>
              </div>
            )}
            {property.interior.windowTypes && (
              <div>
                <span className="font-medium text-gray-700">Windows: </span>
                <span className="text-gray-600">{property.interior.windowTypes}</span>
              </div>
            )}
          </div>
        </InfoSection>
      )}

      {/* Exterior Features */}
      {property.exterior && (
        <InfoSection title="Exterior Features">
          <div className="grid grid-cols-1 gap-3 mt-3">
            {property.exterior.materials && (
              <div>
                <span className="font-medium text-gray-700">Exterior Materials: </span>
                <span className="text-gray-600">{property.exterior.materials}</span>
              </div>
            )}
            {property.exterior.roofType && (
              <div>
                <span className="font-medium text-gray-700">Roof Type: </span>
                <span className="text-gray-600">{property.exterior.roofType}</span>
              </div>
            )}
            {property.exterior.outdoorSpaces && (
              <div>
                <span className="font-medium text-gray-700">Outdoor Spaces: </span>
                <p className="text-gray-600 mt-1">{property.exterior.outdoorSpaces}</p>
              </div>
            )}
            {property.exterior.landscaping && (
              <div>
                <span className="font-medium text-gray-700">Landscaping: </span>
                <p className="text-gray-600 mt-1">{property.exterior.landscaping}</p>
              </div>
            )}
          </div>
        </InfoSection>
      )}

      {/* Climate Risk Information */}
      {property.climateRisk && (
        <InfoSection title="Climate Risk Assessment">
          <div className="space-y-2 mt-3">
            {property.climateRisk.floodFactor && (
              <ClimateRiskBadge factor={property.climateRisk.floodFactor} label="Flood Risk" />
            )}
            {property.climateRisk.fireFactor && (
              <ClimateRiskBadge factor={property.climateRisk.fireFactor} label="Fire Risk" />
            )}
            {property.climateRisk.heatFactor && (
              <ClimateRiskBadge factor={property.climateRisk.heatFactor} label="Heat Risk" />
            )}
            {property.climateRisk.windFactor && (
              <ClimateRiskBadge factor={property.climateRisk.windFactor} label="Wind Risk" />
            )}
            {property.climateRisk.airQualityFactor && (
              <ClimateRiskBadge factor={property.climateRisk.airQualityFactor} label="Air Quality" />
            )}
          </div>
        </InfoSection>
      )}

      {/* Public Facts */}
      {property.publicFacts && (
        <InfoSection title="Public Facts & Records">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {property.publicFacts.assessedValue && (
              <div>
                <span className="font-medium text-gray-700">Assessed Value: </span>
                <span className="text-gray-600">{formatPrice(property.publicFacts.assessedValue)}</span>
              </div>
            )}
            {property.publicFacts.taxAmount && (
              <div>
                <span className="font-medium text-gray-700">Annual Tax: </span>
                <span className="text-gray-600">${property.publicFacts.taxAmount.toLocaleString()}</span>
              </div>
            )}
            {property.publicFacts.mlsNumber && (
              <div>
                <span className="font-medium text-gray-700">MLS #: </span>
                <span className="text-gray-600">{property.publicFacts.mlsNumber}</span>
              </div>
            )}
            {property.publicFacts.daysOnMarket && (
              <div>
                <span className="font-medium text-gray-700">Days on Market: </span>
                <span className="text-gray-600">{property.publicFacts.daysOnMarket}</span>
              </div>
            )}
          </div>
        </InfoSection>
      )}
    </section>
  );
};

export default PropertyDetails;
