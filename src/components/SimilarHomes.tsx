import React, { useEffect, useState } from "react";
import { collection, query, where, limit, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase"; // your firebase config
import { formatPrice } from "@/lib/utils";
import { Property } from "@/app/property/[id]/page";

interface SimilarHomesProps {
  currentPropertyId: string;
  propertyType: string;
}

const SimilarHomes: React.FC<SimilarHomesProps> = ({ currentPropertyId, propertyType }) => {
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "properties"),
          where("propertyType", "==", propertyType),
          limit(10) // fetch more in case we need to filter out current property
        );
        const querySnapshot = await getDocs(q);

        const filteredProperties: Property[] = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentPropertyId) {
            filteredProperties.push({ id: doc.id, ...doc.data() } as Property);
          }
        });

        // Take only first 3 similar properties
        setSimilarProperties(filteredProperties.slice(0, 3));
      } catch (error) {
        console.error("Error fetching similar properties:", error);
      }
      setLoading(false);
    }

    fetchSimilar();
  }, [currentPropertyId, propertyType]);

  if (loading) {
    return <p>Loading similar homes...</p>;
  }

  if (similarProperties.length === 0) {
    return <p>No similar homes found.</p>;
  }

  return (
    <section id="similar-homes" className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Similar Homes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarProperties.map((prop) => (
          <div key={prop.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 h-48 flex items-center justify-center">
              {prop.mainImage ? (
                <img
                  src={prop.mainImage}
                  alt={prop.title}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              ) : (
                <p className="text-gray-500">No Image</p>
              )}
            </div>
            <div className="p-4">
              <p className="font-bold text-lg">{formatPrice(prop.price)}</p>
              <p className="text-gray-600">
                {prop.beds} bed &bull; {prop.baths} bath &bull; {prop.sqft.toLocaleString()} sqft
              </p>
              <p className="text-sm text-gray-500 mt-1">{prop.address}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SimilarHomes;
