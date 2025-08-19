import { Timestamp } from "firebase-admin/firestore";
// Enhanced Property interface with all new fields
export interface Property {
  id: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  propertyType: string;
  yearBuilt: number;
  description?: string;

  //new Listing type field
  listingType: 'for-sale' | 'for-sale-by-owner' | 'rental' | 'coming-soon' | 'sold' | 'off-market';

  //more specific rental details
  rentalDetails?:{
    leaseTerms?:string[]; //month to month-1 year, etc
    availableDate?: string;
    securityDeposit?: number;
    applicationFee?: number;
    brokerFee?: number;
    lastRentalIncrease?: string;
  }
  
  // Listing information
  listedBy: {
    name: string;
    contact: string;
    email: string;
    agentType?: 'realtor' | 'owner' | 'property-manager'
  };
  
  // Amenities and images
  amenities: string[];
  imageUrls: string[];
  mainImage: string;
  createdAt: Timestamp;
  virtualTourUrl?: string;
  
  // Location fields
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  
  // Building Information
  buildingInfo?: {
    name?: string;
    type?: string;
    totalStories?: number;
    totalUnits?: number;
  };
  
  // Unit Details
  unitDetails?: {
    unitNumber?: string;
    floor?: number;
    lotSize?: number;
    parkingSpaces?: number;
    parkingType?: string[];
  };
  
  // HOA Information
  hoa?: {
    fee?: number;
    frequency?: string;
    includes?: string[];
  };
  
  // Pet Policy
  petPolicy?: string[];
  
  // Utilities
  utilities?: {
    included?: string[];
    paidBy?: string;
  };
  
  // Interior Features
  interior?: {
    flooringTypes?: string;
    kitchenFeatures?: string;
    appliancesIncluded?: string;
    fireplaces?: number;
    windowTypes?: string;
  };
  
  // Exterior Features
  exterior?: {
    materials?: string;
    roofType?: string;
    outdoorSpaces?: string;
    landscaping?: string;
  };
  
  // Climate Risk Factors
  climateRisk?: {
    floodFactor?: string;
    fireFactor?: string;
    heatFactor?: string;
    windFactor?: string;
    airQualityFactor?: string;
  };
  
  // Public Facts
  publicFacts?: {
    assessedValue?: number;
    taxAmount?: number;
    mlsNumber?: string;
    daysOnMarket?: number;
  };
}