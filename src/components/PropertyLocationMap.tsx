// components/PropertyLocationMap.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Search } from "lucide-react";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  formattedAddress: string;
}

interface PropertyLocationMapProps {
  onLocationSelect: (location: LocationData) => void;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
  readOnly?: boolean;
  height?: string;
  zoom?: number;
  showInfoWindow?: boolean;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function PropertyLocationMap({
  onLocationSelect,
  initialAddress = "",
  initialLat = 34.0522, // Default LA
  initialLng = -118.2437,
  readOnly = false,
  height = "384px",
  zoom = 15,
  showInfoWindow = true,
}: PropertyLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [searchAddress, setSearchAddress] = useState(initialAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLat && initialLng
      ? {
          lat: initialLat,
          lng: initialLng,
          address: initialAddress,
          formattedAddress: initialAddress,
        }
      : null
  );

  // Load Google Maps Script
  useEffect(() => {
    const existingScript = document.getElementById("googleMapsScript");

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.id = "googleMapsScript";
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapLoaded(true);
      document.body.appendChild(script);
    } else if (window.google) {
      setIsMapLoaded(true);
    }
  }, []);

  // Reverse geocode helper
  const reverseGeocode = useCallback(
    async (lat: number, lng: number, geocoderInstance?: google.maps.Geocoder) => {
      const currentGeocoder = geocoderInstance || geocoder;
      if (!currentGeocoder || readOnly) return;

      try {
        const response = await new Promise<google.maps.GeocoderResult>(
          (resolve, reject) => {
            currentGeocoder.geocode(
              { location: { lat, lng } },
              (results, status) => {
                if (status === "OK" && results && results[0]) {
                  resolve(results[0]);
                } else {
                  reject(new Error("Geocoding failed"));
                }
              }
            );
          }
        );

        const locationData: LocationData = {
          lat,
          lng,
          address: response.formatted_address,
          formattedAddress: response.formatted_address,
        };

        setSelectedLocation(locationData);
        setSearchAddress(response.formatted_address);
        onLocationSelect(locationData);
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }
    },
    [geocoder, readOnly, onLocationSelect]
  );

  // Initialize Map
  useEffect(() => {
    if (isMapLoaded && window.google && mapRef.current && !map) {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: initialLat, lng: initialLng },
        zoom: readOnly ? zoom + 1 : zoom,
        mapTypeControl: false,
        streetViewControl: readOnly,
        fullscreenControl: readOnly,
        zoomControl: true,
        mapTypeId: "roadmap",
      };

      if (readOnly) {
        mapOptions.gestureHandling = "cooperative";
        mapOptions.scrollwheel = true;
        mapOptions.disableDoubleClickZoom = false;
      }

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      const newGeocoder = new window.google.maps.Geocoder();

      const markerOptions: google.maps.MarkerOptions = {
        map: newMap,
        animation: window.google.maps.Animation.DROP,
      };

      if (readOnly) {
        markerOptions.icon = {
          url:
            "data:image/svg+xml," +
            encodeURIComponent(`
              <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0C8.954 0 0 8.954 0 20C0 35 20 50 20 50S40 35 40 20C40 8.954 31.046 0 20 0Z" fill="#2563EB"/>
                <circle cx="20" cy="20" r="8" fill="white"/>
                <circle cx="20" cy="20" r="4" fill="#2563EB"/>
              </svg>
            `),
          scaledSize: new window.google.maps.Size(40, 50),
          anchor: new window.google.maps.Point(20, 50),
        };
      } else {
        markerOptions.draggable = true;
      }

      const newMarker = new window.google.maps.Marker(markerOptions);

      if (selectedLocation) {
        newMarker.setPosition({
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        });
      }

      if (!readOnly) {
        newMap.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (!event.latLng) return;
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          newMarker.setPosition({ lat, lng });
          reverseGeocode(lat, lng, newGeocoder);
        });

        newMarker.addListener("dragend", (event: google.maps.MapMouseEvent) => {
          if (!event.latLng) return;
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          reverseGeocode(lat, lng, newGeocoder);
        });
      }

      if (readOnly && selectedLocation && showInfoWindow) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; font-family: system-ui, sans-serif; min-width: 200px;">
              <div style="font-weight: 600; margin-bottom: 6px; color: #1f2937; font-size: 14px;">
                Property Location
              </div>
              <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">
                ${selectedLocation.formattedAddress || selectedLocation.address}
              </div>
            </div>
          `,
        });
        newMarker.addListener("click", () => {
          infoWindow.open(newMap, newMarker);
        });
      }

      setMap(newMap);
      setMarker(newMarker);
      setGeocoder(newGeocoder);
    }
  }, [isMapLoaded, map, initialLat, initialLng, selectedLocation, readOnly, zoom, showInfoWindow, reverseGeocode]);

  // ✅ Address search and everything else stays the same...

  // Address search
  const handleAddressSearch = async () => {
    if (!geocoder || !searchAddress.trim() || readOnly) return;
    setIsSearching(true);

    try {
      const response = await new Promise<google.maps.GeocoderResult>(
        (resolve, reject) => {
          geocoder.geocode({ address: searchAddress }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error("Address not found"));
            }
          });
        }
      );

      const location = response.geometry.location;
      const lat = location.lat();
      const lng = location.lng();

      if (map && marker) {
        map.setCenter({ lat, lng });
        map.setZoom(16);
        marker.setPosition({ lat, lng });
      }

      const locationData: LocationData = {
        lat,
        lng,
        address: response.formatted_address,
        formattedAddress: response.formatted_address,
      };

      setSelectedLocation(locationData);
      setSearchAddress(response.formatted_address);
      onLocationSelect(locationData);
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Address not found. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddressSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search input (hidden in read-only mode) */}
      {!readOnly && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Property Location
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter property address..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={isSearching || !searchAddress.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Enter an address and click search, or click directly on the map to
            select a location
          </p>
        </div>
      )}

      {/* Map container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full rounded-lg border border-gray-300 shadow-sm"
          style={{ height, minHeight: height }}
        />
        {!isMapLoaded && (
          <div
            className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center"
            style={{ height }}
          >
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Info */}
      {!readOnly && selectedLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800">Selected Location</h4>
              <p className="text-sm text-green-700 mt-1">
                {selectedLocation.formattedAddress}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)},{" "}
                {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!readOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>How to use:</strong> Search for an address above, or click
            anywhere on the map to select the property location. You can also
            drag the marker to fine-tune the position.
          </p>
        </div>
      )}
    </div>
  );
}
