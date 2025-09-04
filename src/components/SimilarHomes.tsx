import React, { useEffect, useState } from "react";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice } from "@/lib/utils";
import { Property } from "@/app/property/[id]/PropertyInterface";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SimilarHomesProps {
  currentPropertyId: string;
  propertyType: string;
}

const SimilarHomes: React.FC<SimilarHomesProps> = ({ currentPropertyId, propertyType }) => {
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null); // track hovered prop
  const [currentImages, setCurrentImages] = useState<{ [key: string]: number }>({}); // current index per prop


  useEffect(() => {
    async function fetchSimilar() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "properties"),
          where("propertyType", "==", propertyType),
          limit(10)
        );
        const querySnapshot = await getDocs(q);

        const filteredProperties: Property[] = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentPropertyId) {
            filteredProperties.push({ id: doc.id, ...doc.data() } as Property);
          }
        });

        setSimilarProperties(filteredProperties.slice(0, 10));
        // Initialize all image indices to 0
        const indices: { [key: string]: number } = {};
        filteredProperties.forEach((prop) => (indices[prop.id] = 0));
        setCurrentImages(indices);
      } catch (error) {
        console.error("Error fetching similar properties:", error);
      }
      setLoading(false);
    }

    fetchSimilar();
  }, [currentPropertyId, propertyType]);

  const nextImage = (id: string, total: number) => {
    setCurrentImages((prev) => ({
      ...prev,
      [id]: (prev[id] + 1) % total,
    }));
  };

  const prevImage = (id: string, total: number) => {
    setCurrentImages((prev) => ({
      ...prev,
      [id]: (prev[id] - 1 + total) % total,
    }));
  };



  if (loading) return <p>Loading similar homes...</p>;
  if (similarProperties.length === 0) return <p>No similar homes found.</p>;

  return (
    <section id="similar-homes" className="mb-12 w-full">
      <h2 className="text-2xl font-bold mb-6">Similar Homes</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {similarProperties.slice(0, 6).map((prop) => {
          const currentIndex = currentImages[prop.id] || 0;
          const isHovered = hoveredCard === prop.id;

          return (
            <Link key={prop.id} href={`/property/${prop.id}`} passHref>
              <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative"
                onMouseEnter={() => setHoveredCard(prop.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="bg-gray-100 h-48 flex items-center justify-center relative">
                  {prop.imageUrls && prop.imageUrls.length > 0 ? (
                    <Image
                      src={prop.imageUrls[currentIndex]}
                      alt={prop.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <p className="text-gray-500">No Image</p>
                  )}

                  {isHovered && prop.imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          prevImage(prop.id, prop.imageUrls.length);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow z-10"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-800" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          nextImage(prop.id, prop.imageUrls.length);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow z-10"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-800" />
                      </button>
                    </>
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
            </Link>
          );
        })}
      </div>
    </section>

  );
};


export default SimilarHomes;
