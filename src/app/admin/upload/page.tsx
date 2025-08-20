// app/admin/upload/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage, db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import PropertyLocationMap from "@/components/PropertyLocationMap";
import { ChevronDown, ChevronUp } from 'lucide-react';
import ImageCarousel from "@/components/ImageCarousel/ImageCarousel";


import Link from "next/link";
import { useRouter } from "next/navigation";

const AMENITY_OPTIONS = [
  "Pool",
  "Gym",
  "Parking",
  "Covered Parking",
  "24h Security",
  "Beach View",
  "Beach Access",
  "Spa",
  "Restaurant",
  "Balcony",
  "Furnished",
  "Wifi",
  "High Speed Internet",
  "Air Conditioning",
  "Swimming Pool",
  "Infinity Pool",
  "Heated Pool",
  "Jacuzzi",
  "Sauna",
  "Gated Entry",
  "Elevator Access",
  "Outdoor BBQ",
  "Sun Deck",
  "Landscaped Areas",
  "Guest Parking",
  "Electric Vehicle Station",
  "Modern Appliances",
]

const BUILDING_TYPES = [
  "High-Rise",
  "Mid-Rise",
  "Low-Rise",
  "Townhouse Complex",
  "Garden Style",
  "Mixed-Use",
  "Historic Building",
  "New Construction",
  "Luxury Complex"
];

const PET_POLICY_OPTIONS = [
  "No Pets",
  "Cats Only",
  "Dogs Only", 
  "Cats & Dogs Allowed",
  "All Pets Welcome",
  "Service Animals Only",
  "Pet Deposit Required",
  "Pet Rent Required"
];

const UTILITIES_OPTIONS = [
  "Electric",
  "Gas",
  "Water",
  "Sewer",
  "Trash",
  "Internet",
  "Cable",
  "Heating",
  "Air Conditioning"
];

const PARKING_OPTIONS = [
  "Street Parking",
  "Garage - Attached",
  "Garage - Detached", 
  "Carport",
  "Covered Parking",
  "Assigned Parking",
  "Guest Parking",
  "Valet Parking"
];

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  formattedAddress: string;
}

// Expandable Section Component
interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ 
  title, 
  children, 
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

function UploadForm() {
  const { user, logout } = useAuth();
  const isAdmin = useIsAdmin(user?.uid);
  const router = useRouter();

  // Basic Property Information
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sqft, setSqft] = useState("");
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [listingType, setListingType] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [brokerName, setBrokerName] = useState("");
  const [brokerContact, setBrokerContact] = useState("");
  const [brokerEmail, setBrokerEmail] = useState("");
  const [agentType, setAgentType] = useState< 'realtor' | 'owner' | 'property-manager'>('realtor');
  const [description, setDescription] = useState("");

  //rental info
  const [leaseTerms, setLeaseTerms] = useState<string>('');
  const [availableDate, setAvailableDate] = useState("")
  const [securityDeposit, setSecurityDeposit] = useState("")
  const [applicationFee, setApplicationFee] = useState("")
  const [brokerFee, setBrokerFee] = useState("")
  

  // Building/Complex Information
  const [buildingName, setBuildingName] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [totalStories, setTotalStories] = useState("");
  const [unitFloor, setUnitFloor] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [petPolicy, setPetPolicy] = useState<string[]>([]);
  const [hoaFee, setHoaFee] = useState("");
  const [hoaFrequency, setHoaFrequency] = useState("");
  const [hoaIncludes, setHoaIncludes] = useState<string[]>([]);

  // Unit Details
  const [unitNumber, setUnitNumber] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [parkingType, setParkingType] = useState<string[]>([]);

  // Utilities & Services
  const [utilitiesIncluded, setUtilitiesIncluded] = useState<string[]>([]);
  const [utilitiesPaidBy, setUtilitiesPaidBy] = useState("");

  // Interior Features
  const [flooringTypes, setFlooringTypes] = useState("");
  const [kitchenFeatures, setKitchenFeatures] = useState("");
  const [appliancesIncluded, setAppliancesIncluded] = useState("");
  const [fireplaces, setFireplaces] = useState("");
  const [windowTypes, setWindowTypes] = useState("");

  // Exterior Features
  const [exteriorMaterials, setExteriorMaterials] = useState("");
  const [roofType, setRoofType] = useState("");
  const [outdoorSpaces, setOutdoorSpaces] = useState("");
  const [landscaping, setLandscaping] = useState("");

  // Climate Risk Information
  const [floodFactor, setFloodFactor] = useState("");
  const [fireFactor, setFireFactor] = useState("");
  const [heatFactor, setHeatFactor] = useState("");
  const [windFactor, setWindFactor] = useState("");
  const [airQualityFactor, setAirQualityFactor] = useState("");

  // Public Records & Facts
  const [assessedValue, setAssessedValue] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [mlsNumber, setMlsNumber] = useState("");
  const [daysOnMarket, setDaysOnMarket] = useState("");

  // Location data from map
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  

  // amenities section 
  const [amenities, setAmenities] = useState<string[]>([]);



  // define removeImage BEFORE JSX
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (isAdmin === false) {
      router.push("/");
    }
  }, [isAdmin, router]);

  // Show loading while checking admin status
  if (isAdmin === null) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-64">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle location selection from map
  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location);
    setAddress(location.formattedAddress);
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const newFiles = fileArray.slice(0, 20 - images.length);
      setImages(prev => [...prev, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Upload images to Firebase
  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const image of images) {
      const imageRef = ref(storage, `property-images/${image.name}-${Date.now()}`);
      const uploadTask = uploadBytesResumable(imageRef, image);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          reject,
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            urls.push(downloadURL);
            resolve();
          }
        );
      });
    }

    return urls;
  };

  // Upload property to Firestore
  const handleUpload = async () => {
    if (!isAdmin) {
      alert("Only admin users are allowed to upload properties.");
      return;
    }

    if (
      images.length === 0 ||
      !title || !price || !beds || !baths || !sqft ||
      !address || !propertyType || !yearBuilt || !brokerName || !brokerContact ||
      !locationData
    ) {
      return alert("Please fill out all required fields, select a location on the map, and upload at least one image.");
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const imageUrls = await uploadImages();

      // Comprehensive property data structure
      await addDoc(collection(db, "properties"), {
        // Basic Information
        listingType,
        title,
        price: Number(price),
        beds: Number(beds),
        baths: Number(baths),
        sqft: Number(sqft),
        address,
        description,
        
        // Location data
        lat: locationData.lat,
        lng: locationData.lng,
        formattedAddress: locationData.formattedAddress,
        location: {
          lat: locationData.lat,
          lng: locationData.lng,
          formattedAddress: locationData.formattedAddress
        },
        

        
        propertyType,
        yearBuilt: Number(yearBuilt),

        //rental information only if rental
        ...(listingType === 'rental' && {
          rentalDetails: {
            leaseTerms,
            availableDate: availableDate || null,
            securityDeposit: securityDeposit ? Number(securityDeposit) : null,
            applicationFee: applicationFee ? Number(applicationFee) : null,
            brokerFee: brokerFee ? Number(brokerFee) : null,
          }
        }),
        
        // Building Information
        buildingInfo: {
          name: buildingName,
          type: buildingType,
          totalStories: totalStories ? Number(totalStories) : null,
          totalUnits: totalUnits ? Number(totalUnits) : null,
        },
        
        // Unit Details
        unitDetails: {
          unitNumber,
          floor: unitFloor ? Number(unitFloor) : null,
          lotSize: lotSize ? Number(lotSize) : null,
          parkingSpaces: parkingSpaces ? Number(parkingSpaces) : null,
          parkingType,
        },
        
        // HOA Information
        hoa: {
          fee: hoaFee ? Number(hoaFee) : null,
          frequency: hoaFrequency,
          includes: hoaIncludes,
        },
        
        // Pet Policy
        petPolicy,
        
        // Utilities
        utilities: {
          included: utilitiesIncluded,
          paidBy: utilitiesPaidBy,
        },
        
        // Interior Features
        interior: {
          flooringTypes,
          kitchenFeatures,
          appliancesIncluded,
          fireplaces: fireplaces ? Number(fireplaces) : null,
          windowTypes,
        },
        
        // Exterior Features
        exterior: {
          materials: exteriorMaterials,
          roofType,
          outdoorSpaces,
          landscaping,
        },
        
        // Climate Risk Factors
        climateRisk: {
          floodFactor,
          fireFactor,
          heatFactor,
          windFactor,
          airQualityFactor,
        },
        
        // Public Facts
        publicFacts: {
          assessedValue: assessedValue ? Number(assessedValue) : null,
          taxAmount: taxAmount ? Number(taxAmount) : null,
          mlsNumber,
          daysOnMarket: daysOnMarket ? Number(daysOnMarket) : null,
        },
        
        listedBy: {
          agentType,
          name: brokerName,
          contact: brokerContact,
          email: brokerEmail,
        },
        amenities,
        imageUrls,
        mainImage: imageUrls[0],
        createdAt: Timestamp.now(),
      });

      // Clear form function
      const clearForm = () => {
        setTitle("");
        setPrice("");
        setBeds("");
        setBaths("");
        setSqft("");
        setAddress("");
        setDescription("");
        setLocationData(null);
        setPropertyType("");
        setYearBuilt("");
        setBrokerName("");
        setBrokerContact("");
        setBrokerEmail("");
        setAgentType('realtor' as 'realtor' | 'owner'| 'property-manager');
        setLeaseTerms("");
        setAvailableDate("");
        setSecurityDeposit("");
        setApplicationFee("");
        setBrokerFee("");
        setBuildingName("");
        setBuildingType("");
        setPropertyType("")
        setTotalStories("");
        setUnitFloor("");
        setTotalUnits("");
        setPetPolicy([]);
        setHoaFee("");
        setHoaFrequency("");
        setHoaIncludes([]);
        setUnitNumber("");
        setLotSize("");
        setParkingSpaces("");
        setParkingType([]);
        setUtilitiesIncluded([]);
        setUtilitiesPaidBy("");
        setFlooringTypes("");
        setKitchenFeatures("");
        setAppliancesIncluded("");
        setFireplaces("");
        setWindowTypes("");
        setExteriorMaterials("");
        setRoofType("");
        setOutdoorSpaces("");
        setLandscaping("");
        setFloodFactor("");
        setFireFactor("");
        setHeatFactor("");
        setWindFactor("");
        setAirQualityFactor("");
        setAssessedValue("");
        setTaxAmount("");
        setMlsNumber("");
        setDaysOnMarket("");
        setImages([]);
        setPreviews([]);
        setAmenities([]);
        setUploadProgress(0);
        
      };

      clearForm();
      alert("Upload successful!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upload Property</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.email}
          </span>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Admin only warning */}
      {!isAdmin && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6 text-center font-medium">
          You do not have permission to upload properties.
        </div>
      )}

      <fieldset disabled={!isAdmin}>

      
        {/* Basic Property Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <select 
                value={listingType} 
                onChange={e => setListingType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select listing type</option>
                <option value="for-sale">For Sale</option>
                <option value="rental">Rental</option>
                <option value="for-sale-by-owner">For Sale by Owner</option>
                <option value="coming-soon">Coming soon</option>
                <option value="sold">Sold</option>
                <option value="off-market">Off Market</option>
              </select>
            <input 
              type="text" 
              placeholder="Property Title*" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required
            />
            <input 
              type="number" 
              placeholder="Price ($)*" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required
            />
            <input 
              type="number" 
              placeholder="Bedrooms*" 
              value={beds} 
              onChange={e => setBeds(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required
            />
            <input 
              type="number" 
              placeholder="Bathrooms*" 
              value={baths} 
              onChange={e => setBaths(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required
            />
            <input 
              type="number" 
              placeholder="Square Footage*" 
              value={sqft} 
              onChange={e => setSqft(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required
            />
            <input 
              type="number" 
              placeholder="Year Built*" 
              value={yearBuilt} 
              onChange={e => setYearBuilt(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required
            />
            <select 
              value={propertyType} 
              onChange={e => setPropertyType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Property Type*</option>
              <option value="Single Family Home">Single Family Home</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Condo">Condo</option>
              <option value="Multi-Family">Multi-Family</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
            </select>
            <input 
              type="text" 
              placeholder="MLS Number" 
              value={mlsNumber} 
              onChange={e => setMlsNumber(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          {/* Property Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the property..."
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Property Location</h2>
          <PropertyLocationMap 
            onLocationSelect={handleLocationSelect}
            initialAddress={address}
            readOnly={false}
          />
          
          {/* Display selected location info */}
          {locationData && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">Selected Location:</h4>
              <p className="text-sm text-green-700">{locationData.formattedAddress}</p>
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Building/Complex Information */}

           {/* Rental Features*/}
        <ExpandableSection title="Rental Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          
            <input 
              type="text" 
              placeholder="Available Date" 
              value={availableDate} 
              onChange={e => setAvailableDate(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Security Deposit" 
              value={securityDeposit} 
              onChange={e => setSecurityDeposit(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Application Fee?" 
              value={applicationFee} 
              onChange={e => setApplicationFee(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Broker Fee" 
              value={brokerFee} 
              onChange={e => setBrokerFee(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="mt-4">
             <textarea
              value={leaseTerms}
              onChange={e => setLeaseTerms(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Lease Terms"
            />
          </div>
        </ExpandableSection>

 {/* Building/Complex Information */}
        <ExpandableSection title="Building & Complex Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input 
              type="text" 
              placeholder="Building/Complex Name" 
              value={buildingName} 
              onChange={e => setBuildingName(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <select 
              value={buildingType} 
              onChange={e => setBuildingType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Building Type</option>
              {BUILDING_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="Total Stories in Building" 
              value={totalStories} 
              onChange={e => setTotalStories(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Total Units in Building" 
              value={totalUnits} 
              onChange={e => setTotalUnits(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </ExpandableSection>

        {/* Unit Details */}
        <ExpandableSection title="Unit Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input 
              type="text" 
              placeholder="Unit Number" 
              value={unitNumber} 
              onChange={e => setUnitNumber(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Floor Number" 
              value={unitFloor} 
              onChange={e => setUnitFloor(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Lot Size (sq ft)" 
              value={lotSize} 
              onChange={e => setLotSize(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Number of Parking Spaces" 
              value={parkingSpaces} 
              onChange={e => setParkingSpaces(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          {/* Parking Types */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parking Types
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {PARKING_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={parkingType.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setParkingType((prev) => [...prev, option]);
                      } else {
                        setParkingType((prev) => prev.filter((i) => i !== option));
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </ExpandableSection>

        {/* HOA Information */}
        <ExpandableSection title="HOA Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input 
              type="number" 
              placeholder="HOA Fee Amount ($)" 
              value={hoaFee} 
              onChange={e => setHoaFee(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <select 
              value={hoaFrequency} 
              onChange={e => setHoaFrequency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">HOA Fee Frequency</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Semi-Annually">Semi-Annually</option>
              <option value="Annually">Annually</option>
            </select>
          </div>
          
          {/* HOA Includes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HOA Includes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {["Water", "Sewer", "Trash", "Landscaping", "Pool Maintenance", "Security", "Exterior Maintenance", "Insurance", "Cable/Internet", "Gym Access"].map((option) => (
                <label key={option} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={hoaIncludes.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setHoaIncludes((prev) => [...prev, option]);
                      } else {
                        setHoaIncludes((prev) => prev.filter((i) => i !== option));
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </ExpandableSection>

        {/* Pet Policy */}
        <ExpandableSection title="Pet Policy">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {PET_POLICY_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={petPolicy.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPetPolicy((prev) => [...prev, option]);
                    } else {
                      setPetPolicy((prev) => prev.filter((i) => i !== option));
                    }
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </ExpandableSection>

        {/* Utilities & Services */}
        <ExpandableSection title="Utilities & Services">
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utilities Included in Rent/HOA
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {UTILITIES_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={utilitiesIncluded.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setUtilitiesIncluded((prev) => [...prev, option]);
                      } else {
                        setUtilitiesIncluded((prev) => prev.filter((i) => i !== option));
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <select 
              value={utilitiesPaidBy} 
              onChange={e => setUtilitiesPaidBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Who Pays Utilities?</option>
              <option value="Tenant">Tenant</option>
              <option value="Owner">Owner</option>
              <option value="HOA">HOA</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </ExpandableSection>

        {/* Interior Features */}
        <ExpandableSection title="Interior Features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input 
              type="text" 
              placeholder="Flooring Types (e.g., Hardwood, Tile, Carpet)" 
              value={flooringTypes} 
              onChange={e => setFlooringTypes(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="text" 
              placeholder="Kitchen Features" 
              value={kitchenFeatures} 
              onChange={e => setKitchenFeatures(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="text" 
              placeholder="Appliances Included" 
              value={appliancesIncluded} 
              onChange={e => setAppliancesIncluded(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Number of Fireplaces" 
              value={fireplaces} 
              onChange={e => setFireplaces(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="text" 
              placeholder="Window Types" 
              value={windowTypes} 
              onChange={e => setWindowTypes(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 md:col-span-2" 
            />
          </div>
        </ExpandableSection>

        {/* Exterior Features */}
        <ExpandableSection title="Exterior Features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input 
              type="text" 
              placeholder="Exterior Materials" 
              value={exteriorMaterials} 
              onChange={e => setExteriorMaterials(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="text" 
              placeholder="Roof Type" 
              value={roofType} 
              onChange={e => setRoofType(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div className="mt-4">
            <textarea
              value={outdoorSpaces}
              onChange={e => setOutdoorSpaces(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Outdoor Spaces (patios, balconies, decks, etc.)"
            />
          </div>
          
          <div className="mt-4">
            <textarea
              value={landscaping}
              onChange={e => setLandscaping(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Landscaping Details"
            />
          </div>
        </ExpandableSection>

        {/* Climate Risk Information */}
        <ExpandableSection title="Climate Risk Factors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flood Factor</label>
              <select 
                value={floodFactor} 
                onChange={e => setFloodFactor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Risk Level</option>
                <option value="Minimal">Minimal</option>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Major">Major</option>
                <option value="Severe">Severe</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fire Factor</label>
              <select 
                value={fireFactor} 
                onChange={e => setFireFactor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Risk Level</option>
                <option value="Minimal">Minimal</option>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Major">Major</option>
                <option value="Severe">Severe</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heat Factor</label>
              <select 
                value={heatFactor} 
                onChange={e => setHeatFactor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Risk Level</option>
                <option value="Minimal">Minimal</option>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Major">Major</option>
                <option value="Severe">Severe</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wind Factor</label>
              <select 
                value={windFactor} 
                onChange={e => setWindFactor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Risk Level</option>
                <option value="Minimal">Minimal</option>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Major">Major</option>
                <option value="Severe">Severe</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Air Quality Factor</label>
              <select 
                value={airQualityFactor} 
                onChange={e => setAirQualityFactor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Quality Level</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Very Poor">Very Poor</option>
              </select>
            </div>
          </div>
        </ExpandableSection>

        {/* Public Facts & Records */}
        <ExpandableSection title="Public Facts & Records">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input 
              type="number" 
              placeholder="Assessed Value ($)" 
              value={assessedValue} 
              onChange={e => setAssessedValue(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Annual Tax Amount ($)" 
              value={taxAmount} 
              onChange={e => setTaxAmount(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="number" 
              placeholder="Days on Market" 
              value={daysOnMarket} 
              onChange={e => setDaysOnMarket(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </ExpandableSection>

        {/* Broker Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Listing Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select 
              value={agentType} 
              onChange={e => setAgentType(e.target.value as 'realtor' | 'owner'| 'property-manager')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Listing By*</option>
              <option value="realtor">Realtor</option>
              <option value="owner">Owner</option>
              <option value="property-manager">Property Manager</option>
              
              
            </select>

            <input 
              type="text" 
              placeholder="Broker/Agent Name*" 
              value={brokerName} 
              onChange={e => setBrokerName(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required
            />
            <input 
              type="text" 
              placeholder="Broker Contact Info*" 
              value={brokerContact} 
              onChange={e => setBrokerContact(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required
            />
             <input 
              type="email" 
              placeholder="Broker Email Info*" 
              value={brokerEmail} 
              onChange={e => setBrokerEmail(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required
            />
          </div>
        </div>

        {/* Amenities Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {AMENITY_OPTIONS.map((item) => (
              <label key={item} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={amenities.includes(item)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAmenities((prev) => [...prev, item]);
                    } else {
                      setAmenities((prev) => prev.filter((i) => i !== item));
                    }
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
          
          {/* Selected amenities summary */}
          {amenities.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                Selected amenities ({amenities.length}):
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {amenities.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Image Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Property Images</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images ({images.length}/20)*
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={images.length >= 20}
              required
            />
            {images.length >= 20 && (
              <p className="text-sm text-red-600 mt-1">Maximum 20 images allowed</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              The first image will be used as the main property image. You can reorder by clicking on thumbnails below.
            </p>
          </div>

          {/* Image Carousel Preview */}
          {previews.length > 0 && (
            <ImageCarousel 
              previews={previews} 
              onRemoveImage={removeImage}
            />
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="mb-4">
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <button
            onClick={handleUpload}
            disabled={uploading || images.length === 0 || !isAdmin || !locationData}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading... {uploadProgress}%
              </div>
            ) : (
              `Upload Property (${images.length} image${images.length !== 1 ? 's' : ''})`
            )}
          </button>
          
          {!locationData && (
            <p className="text-sm text-red-600 mt-2 text-center">
              Please select a location on the map before uploading
            </p>
          )}
          
          {/* Upload summary */}
          {locationData && images.length > 0 && !uploading && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Ready to upload:</strong> {title || 'Property'} with {images.length} image{images.length !== 1 ? 's' : ''} 
                at {locationData.formattedAddress}
              </p>
            </div>
          )}
        </div>
      </fieldset>

      <div className="pt-6">
        <Link
          href="/"
          className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

// Wrap with ProtectedRoute
export default function AdminUploadPage() {
  return (
    <ProtectedRoute>
      <UploadForm />
    </ProtectedRoute>
  );
}