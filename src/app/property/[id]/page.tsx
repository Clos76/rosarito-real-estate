// app/property/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PropertyLocationMap from "@/components/PropertyLocationMap";
import PropertyHeader from "@/components/PropertyHeader";
import PropertyOverview from "@/components/PropertyOverview";
import PropertyHistory from "@/components/PropertyHistory";
import Amenities from "@/components/Amenities";
import ImageCarousel from "@/components/ImageCarousel";
import PropertyDetails from "@/components/PropertyDetails";
import SimilarHomes from "@/components/SimilarHomes";
import {Property} from "@/app/property/[id]/PropertyInterface"
import MortgageCalculator from "@/components/MortgageCalculator";


// Enhanced Property interface with all new fields

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [showContactForm, setShowContactForm] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "I am interested in this property and would like more information."
  });

  useEffect(() => {
    async function fetchProperty() {
      if (!params.id) return;

      try {
        const propertyDoc = await getDoc(doc(db, "properties", params.id as string));

        if (propertyDoc.exists()) {
          const propertyData = {
            id: propertyDoc.id,
            ...propertyDoc.data()
          } as Property;
          setProperty(propertyData);
        } else {
          setError("Property not found");
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [params.id]);

  // Scroll spy for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["overview", "details", "location", "property-history", "schools", "similar-homes"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would implement the email functionality
    alert("Contact form submitted! (Email functionality to be implemented)");
    setShowContactForm(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-xl">Loading property details...</div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error || "Property not found"}</h1>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Mock data for sections that aren't in your current schema
  const propertyHistory = [
    { date: "2025-01-15", event: "Listed for rent", source: "Owner", price: property.price + 350 },
    { date: "2025-04-20", event: "Price reduced", source: "Owner", price: property.price + 150 },
    { date: "2025-07-10", event: "Price reduced", source: "Owner", price: property.price  }
  ];

  const nearbySchools = [
    { name: "Lincoln Elementary", rating: 9, distance: "0.3 miles", type: "Elementary" },
    { name: "Roosevelt Middle School", rating: 8, distance: "0.7 miles", type: "Middle" },
    { name: "Washington High School", rating: 7, distance: "1.2 miles", type: "High" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to listings
        </button>
      </div>

      {/* Property Header */}
      <div className="mb-8">
        <PropertyHeader
          title={property.title}
          address={property.address}
          price={property.price}
          beds={property.beds}
          baths={property.baths}
          sqft={property.sqft}
          propertyType={property.propertyType}
          yearBuilt={property.yearBuilt}
        />
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40 mb-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "details", label: "Property Details" },
            { id: "location", label: "Location" },
            { id: "property-history", label: "Property History" },
            { id: "schools", label: "Schools" },
            { id: "similar-homes", label: "Similar Homes" }
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => scrollToSection(nav.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${activeSection === nav.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {nav.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Image Carousel */}
          <ImageCarousel
            images={property.imageUrls}
            propertyTitle={property.title}
          />

          {/* Overview Section */}
          <section id="overview" className="mb-12">
            <PropertyOverview
              price={property.price}
              beds={property.beds}
              baths={property.baths}
              sqft={property.sqft}
              propertyType={property.propertyType}
              yearBuilt={property.yearBuilt}
              lat={property.lat}
              lng={property.lng}
              address={property.address}
              formattedAddress={property.formattedAddress}
            />
          </section>

          {/* Property Description */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Property Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {property.description || (
                  `This beautiful ${property.propertyType.toLowerCase()} offers ${property.beds} bedrooms and ${property.baths} bathrooms
                  across ${property.sqft.toLocaleString()} square feet of living space. Built in ${property.yearBuilt}, this property
                  combines modern amenities with classic charm. Located in a desirable neighborhood with easy access to schools,
                  shopping, and transportation.`
                )}
              </p>
            </div>
          </section>

          
         
          <PropertyDetails property={property} /> 
          

          {/* Amenities Section */}
          <Amenities amenities={property.amenities}/>

          {/* Location Section - Enhanced with Interactive Map */}
          <section id="location" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Location & Neighborhood</h2>

            {/* Property Location Map */}
            {property.lat && property.lng ? (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Property Location</h3>
                <PropertyLocationMap
                  onLocationSelect={() => { }} // Read-only mode
                  initialAddress={property.formattedAddress || property.address}
                  initialLat={property.lat}
                  initialLng={property.lng}
                  readOnly={true}
                  height="450px"
                  zoom={15}
                  showInfoWindow={true} // Show info window for more details
                />
              </div>
            ) : (
              <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  <strong>Location:</strong> {property.address}
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  Interactive map not available for this property.
                </p>
              </div>
            )}

            {/* Transportation Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-semibold mb-4">Transit & Transportation</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      🚌
                    </div>
                    <div>
                      <p className="font-medium">Metro Bus</p>
                      <p className="text-sm text-gray-600">3 min walk</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      🚊
                    </div>
                    <div>
                      <p className="font-medium">Light Rail</p>
                      <p className="text-sm text-gray-600">8 min walk</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      🚗
                    </div>
                    <div>
                      <p className="font-medium">Freeway Access</p>
                      <p className="text-sm text-gray-600">5 min drive</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Neighborhood Highlights</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Walking distance to shopping centers</p>
                  <p>• Close to parks and recreational facilities</p>
                  <p>• Easy access to restaurants and cafes</p>
                  <p>• Well-connected to major highways</p>
                  <p>• Family-friendly neighborhood</p>
                </div>
              </div>
            </div>

            {/* Mortgage Calculator */}
            <MortgageCalculator price = {property.price}/>

          </section>

          {/* Property History Section */}
          <PropertyHistory history={propertyHistory}/>

          {/* Schools Section */}
          <section id="schools" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Schools Nearby</h2>
            <div className="space-y-4">
              {nearbySchools.map((school, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{school.name}</h4>
                      <p className="text-gray-600">{school.type} School</p>
                      <p className="text-sm text-gray-500">{school.distance}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        <span className="font-bold">{school.rating}</span>
                        <span className="text-sm">/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Similar Homes Section */}
          <SimilarHomes currentPropertyId={property.id} propertyType={property.propertyType} /> 
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Listing Agent */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Listing Agent</h3>
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold">{property.listedBy.name}</h4>
                  <p className="text-sm text-gray-600">📞 {property.listedBy.contact}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500">📧{property.listedBy.email}</p>
                    
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium mb-2"
              >
                Contact Agent
              </button>
              <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium">
                Schedule Tour
              </button>
            </div>

            {/* Quick Facts Card */}
            {(property.publicFacts?.mlsNumber || property.publicFacts?.daysOnMarket) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Facts</h3>
                <div className="space-y-3 text-sm">
                  {property.publicFacts?.mlsNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">MLS #:</span>
                      <span>{property.publicFacts.mlsNumber}</span>
                    </div>
                  )}
                  {property.publicFacts?.daysOnMarket && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days on Market:</span>
                      <span>{property.publicFacts.daysOnMarket}</span>
                    </div>
                  )}
                  {property.buildingInfo?.type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Building Type:</span>
                      <span>{property.buildingInfo.type}</span>
                    </div>
                  )}
                  {property.unitDetails?.parkingSpaces && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parking:</span>
                      <span>{property.unitDetails.parkingSpaces} space{property.unitDetails.parkingSpaces !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Form */}
            {showContactForm && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Form</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Your Phone"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Message"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}