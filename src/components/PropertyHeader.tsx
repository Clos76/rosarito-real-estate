import React from "react";


//This is the header for property details

type PropertyHeaderProps = {
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
  yearBuilt: number;
};

export default function PropertyHeader({
  title,
  address,
  price,
  beds,
  baths,
  sqft,
  propertyType,
  yearBuilt,
}: PropertyHeaderProps) {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600 text-lg mb-4">{address}</p>
      <div className="flex flex-wrap items-center gap-6 text-lg">
        <span className="text-3xl font-bold text-blue-600">
            ${price.toLocaleString()}
        </span>
        <span><strong>{beds}</strong> beds</span> ·{" "}
        <span><strong>{baths}</strong> baths</span> ·{" "}
        <span><strong>{sqft.toLocaleString()}</strong> sq ft</span>{" "}
      </div>
    </section>
  );
}

