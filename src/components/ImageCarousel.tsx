import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Property } from "@/app/property/[id]/page"; // adjust path if needed

interface ImageCarouselProps {
  images: Property["imageUrls"];
  propertyTitle: Property["title"];
}

export default function ImageCarousel({ images, propertyTitle }: ImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Main image */}
      <div className="relative w-full h-96 md:h-[500px] bg-gray-100  overflow-hidden mb-4">
        <Image
          src={images[currentImageIndex]}
          alt={`${propertyTitle} - Image ${currentImageIndex + 1}`}
          fill
          className="object-cover"
          priority
        />
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-lg z-10"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-lg z-10"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}
        {/* Counter */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentImageIndex + 1} / {images.length}
        </div>
        {/* Main image tag */}
        {currentImageIndex === 0 && (
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Main Photo
          </div>
        )}
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 cursor-pointer group"
              onClick={() => goToImage(index)}
            >
              <div
                className={`relative w-24 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentImageIndex
                    ? "border-blue-500 opacity-100"
                    : "border-gray-300 opacity-50 hover:opacity-90"
                }`}
              >
                <Image
                  src={imageUrl}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs px-1 py-0.5 text-center rounded-b-lg">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
