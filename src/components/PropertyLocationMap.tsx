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
  initialLat = 34.0522,
  initialLng = -118.2437,
  readOnly = false,
  height = "384px",
  zoom = 15,
  showInfoWindow = true,
}: PropertyLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [searchAddress, setSearchAddress] = useState(initialAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLat && initialLng
      ? { lat: initialLat, lng: initialLng, address: initialAddress, formattedAddress: initialAddress }
      : null
  );

  // Reverse geocode helper
  const reverseGeocode = useCallback(
    async (lat: number, lng: number, geocoderInstance?: google.maps.Geocoder) => {
      const currentGeocoder = geocoderInstance || geocoder;
      if (!currentGeocoder || readOnly) return;

      try {
        const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
          currentGeocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) resolve(results[0]);
            else reject(new Error(`Geocoding failed: ${status}`));
          });
        });

        const locationData: LocationData = {
          lat,
          lng,
          address: result.formatted_address,
          formattedAddress: result.formatted_address,
        };

        setSelectedLocation(locationData);
        setSearchAddress(result.formatted_address);
        onLocationSelect(locationData);
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }
    },
    [geocoder, readOnly, onLocationSelect]
  );

  // Load Google Maps Script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setLoadError("Google Maps API key is missing.");
      return;
    }

    if (window.google && window.google.maps) {
      setIsMapLoaded(true);
      return;
    }

    const existingScript = document.getElementById("googleMapsScript");
    if (!existingScript) {
      const script = document.createElement("script");
      // Fixed: Use the correct library parameter for marker
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
      script.id = "googleMapsScript";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Add a small delay to ensure everything is loaded
        setTimeout(() => setIsMapLoaded(true), 100);
      };
      script.onerror = () => setLoadError("Failed to load Google Maps script.");
      document.head.appendChild(script);
    } else if (window.google && window.google.maps) {
      setIsMapLoaded(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapLoaded || !window.google || !mapRef.current || map) return;

    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 10;

    const initializeMap = () => {
      if (!mapRef.current) return;

      const rect = mapRef.current.getBoundingClientRect();
      if ((rect.width === 0 || rect.height === 0) && retryCount < maxRetries) {
        retryCount++;
        timeoutId = setTimeout(initializeMap, 200);
        return;
      }

      const mapOptions: google.maps.MapOptions = {
        center: { lat: initialLat, lng: initialLng },
        zoom: readOnly ? zoom + 1 : zoom,
        mapTypeControl: false,
        streetViewControl: readOnly,
        fullscreenControl: readOnly,
        zoomControl: true,
        mapTypeId: "roadmap",
        gestureHandling: readOnly ? "cooperative" : "greedy",
        scrollwheel: true,
        disableDoubleClickZoom: false,
        disableDefaultUI: false,
        clickableIcons: false,
      };

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      const newGeocoder = new window.google.maps.Geocoder();

      const onMapReady = () => {
        // Create custom marker icon
        const markerIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#2563eb" stroke="white" stroke-width="3"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-family="Arial">🏠</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        };

        // Use standard Marker instead of AdvancedMarkerElement
        const newMarker = new window.google.maps.Marker({
          position: selectedLocation
            ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
            : { lat: initialLat, lng: initialLng },
          map: newMap,
          draggable: !readOnly,
          title: selectedLocation?.formattedAddress || "Property Location",
          icon: markerIcon,
        });

        // Add rectangle for property boundary
        if (selectedLocation) {
          const bounds = {
            north: selectedLocation.lat + 0.000137,
            south: selectedLocation.lat - 0.000137,
            east: selectedLocation.lng + 0.000137,
            west: selectedLocation.lng - 0.000137,
          };

          new window.google.maps.Rectangle({
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.2,
            map: newMap,
            bounds,
          });
        }

        // Click and drag events
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

        // Info window for readonly mode
        if (readOnly && selectedLocation && showInfoWindow) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding:12px;font-family:system-ui,sans-serif;min-width:200px;">
                <div style="font-weight:600;margin-bottom:6px;color:#1f2937;font-size:14px;">Property Location</div>
                <div style="font-size:13px;color:#6b7280;line-height:1.4;">${selectedLocation.formattedAddress}</div>
              </div>
            `,
          });
          
          newMarker.addListener("click", () => {
            infoWindow.open(newMap, newMarker);
          });

          // Auto-open info window in readonly mode
          setTimeout(() => {
            infoWindow.open(newMap, newMarker);
          }, 500);
        }

        setMarker(newMarker);
      };

      // Wait for map to be fully loaded
      google.maps.event.addListenerOnce(newMap, "idle", onMapReady);
      google.maps.event.addListenerOnce(newMap, "tilesloaded", onMapReady);

      setMap(newMap);
      setGeocoder(newGeocoder);
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setTimeout(initializeMap, 100);
    });

    return () => clearTimeout(timeoutId);
  }, [isMapLoaded, map, initialLat, initialLng, selectedLocation, readOnly, zoom, showInfoWindow, reverseGeocode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (marker) {
        marker.setMap(null);
      }
      if (map) {
        google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [marker, map]);

  // Address search functionality
  const handleAddressSearch = async () => {
    if (!geocoder || !searchAddress.trim() || readOnly) return;
    setIsSearching(true);

    try {
      const response = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
        geocoder.geocode({ address: searchAddress }, (results, status) => {
          if (status === "OK" && results && results[0]) resolve(results[0]);
          else reject(new Error(`Address not found: ${status}`));
        });
      });

      const loc = response.geometry.location;
      const locationData: LocationData = {
        lat: loc.lat(),
        lng: loc.lng(),
        address: response.formatted_address,
        formattedAddress: response.formatted_address,
      };

      setSelectedLocation(locationData);
      setSearchAddress(response.formatted_address);
      onLocationSelect(locationData);

      if (map && marker) {
        map.setCenter({ lat: loc.lat(), lng: loc.lng() });
        map.setZoom(16);
        marker.setPosition({ lat: loc.lat(), lng: loc.lng() });
      }
    } catch (error) {
      console.error("Address search error:", error);
      alert("Address not found. Please try again with a different search term.");
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

  // Error state render
  if (loadError) {
    return (
      <div className="space-y-4">
        <div className="w-full rounded-lg border border-red-300 bg-red-50 flex items-center justify-center" style={{ height }}>
          <div className="text-center p-4">
            <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">Map Loading Error</p>
            <p className="text-red-600 text-sm mt-1">{loadError}</p>
            <p className="text-red-600 text-xs mt-2">Please check your Google Maps API key configuration.</p>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Property Location</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter property address (e.g., 123 Main St, Los Angeles, CA)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 transition-colors"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={isSearching || !searchAddress.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors min-w-[120px]"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
          {selectedLocation && (
            <p className="text-sm text-gray-600 mt-2">
              📍 Current location: {selectedLocation.formattedAddress}
            </p>
          )}
        </div>
      )}
      
      <div className="relative w-full">
        <div 
          ref={mapRef} 
          className="w-full rounded-lg border border-gray-300 shadow-sm bg-gray-100" 
          style={{ height, minHeight: height }} 
        />
        
        {!isMapLoaded && !loadError && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10" style={{ height }}>
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600 font-medium">Loading map...</p>
              <p className="text-gray-500 text-sm mt-1">Please wait while we initialize Google Maps</p>
            </div>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="text-xs text-gray-500 mt-2">
          💡 Tip: Click anywhere on the map to place a marker, or drag the existing marker to a new location
        </div>
      )}
    </div>
  );
}