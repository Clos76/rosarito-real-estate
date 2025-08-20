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
      const center = { lat: 32.525, lng: -117.033 };

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        mapTypeControl: true, // Map/Satellite toggle
        streetViewControl: true, // Street View option
      });

      // Add marker
      new window.google.maps.Marker({
        position: center,
        map,
        title: "Property Location",
      });

      // Add rectangle (e.g. marking property bounds)
      new window.google.maps.Rectangle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.2,
        map,
        bounds: {
          north: center.lat + 0.001, // adjust size of square
          south: center.lat - 0.001,
          east: center.lng + 0.001,
          west: center.lng - 0.001,
        },
      });
    }
  }, [isMapLoaded]);

  return <div ref={mapRef} className="w-full h-96 rounded-xl shadow-md" />;
}
