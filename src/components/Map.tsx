"use client";

import { useEffect, useRef, useState } from "react";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Load script dynamically
    const existingScript = document.getElementById("googleMapsScript");

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.id = "googleMapsScript";
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isMapLoaded && window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 32.525, lng: -117.033 },
        zoom: 14,
      });
    }
  }, [isMapLoaded]);

  return <div ref={mapRef} className="w-full h-96" />;
}
