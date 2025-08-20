"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
// Define the type for your property data
interface Property {
  id: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  propertyType: string;
  yearBuilt: number;
  listedBy: {
    name: string;
    contact: string;
  };
  imageUrls: string[];
  mainImage: string;
  createdAt: Timestamp; // Firestore Timestamp
  virtualTourUrl?: string; // Optional field
}

export default function RecommendedSection() {
  const [homes, setHomes] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomes() {
      try {
        const homesQuery = query(
          collection(db, "properties"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const snapshot = await getDocs(homesQuery);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[];

        setHomes(results);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching homes:", err);
        setError("Failed to load properties");
        setLoading(false);
      }
    }
    fetchHomes();
  }, []);

  if (loading) {
    return (
      <section className="w-full px-6 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading properties...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full px-6 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-6 mt-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold mb-2">Recommended For You</h2>
        <p className="text-gray-600 mb-8">Listings we think you&apos;ll love</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {homes.map((home) => (
            <Link key={home.id} href={`/property/${home.id}`}>
            <div key={home.id} className="bg-white rounded shadow hover:shadow-md transition overflow-hidden ring-2 ring-white hover:ring-blue-500 relative h-64">
              <div className="relative w-full h-64">
                <Image
                src={home.mainImage || "/placeholder.jpg"}
                alt={home.title || "Property"}
                fill
                style={{objectFit: "cover"}}
                //full cover of pic on card 
              />
              </div>
              <div className="relative z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent h-full flex flex-col justify-end p-2">
                <p className="text-white text-2xl font-bold ">
                  ${home.price ? home.price.toLocaleString() : "Price not available"}
                </p>

                <div className="flex justify-between items-end text-white">
                  <p className="text-sm ">{home.address || "Address not available"}</p>
                  <div className="flex gap-2 divide-x divide-gray-400 ">

                    <div className="flex flex-col items-center pr-1">
                      <span className="text-sm font-medium">{home.beds || 0}</span>
                      <span className="text-xs">Beds</span>
                    </div>

                    <div className="flex flex-col items-center pr-1">
                      <span className="text-sm font-medium ">{home.baths || 0}</span>
                      <span className="text-xs">Baths</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium">{home.sqft ? home.sqft.toLocaleString() : 0}</span>
                      <span className="text-xs">Sq Ft</span>
                    </div>
                  </div>
                </div>
                {home.virtualTourUrl && (
                  <a
                    href={home.virtualTourUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-300 hover:text-blue-200 hover:underline block mt-1"
                  >
                    Virtual Tour Available
                  </a>
                )}
              </div>
            </div>
            </Link>
          ))}

          {/* Signup card */}
          <div className="flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded p-6 shadow-md ring-2 ring-white hover:ring-blue-500">
            <h3 className="text-lg font-semibold mb-2">Want 2 more exclusive listings?</h3>
            <p className="text-sm mb-4 text-center">Sign up now to unlock private recommendations.</p>
            <Link href="#">
              <span className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-blue-100 transition">
                Sign Up
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-6 flex justify-start ">
          <Link href={"/#"} className="rounded items-center bg-blue-600 mb-4 rounded hover:bg-blue-800">
            <h1 className="text-xl p-2 text-white relative after:content-['→'] after:ml-3 after:text-2xl after:inline-block hover:after:translate-x-1 after:transition-transform pr-4 w-auto">
              View More Properties
            </h1>
          </Link>
        </div>


      </div>
    </section>
  );
}