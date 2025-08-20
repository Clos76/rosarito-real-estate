import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Image Carousel Component for Upload Form
interface ImageCarouselProps {
  previews: string[];
  onRemoveImage: (index: number) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ previews, onRemoveImage }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % previews.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + previews.length) % previews.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (previews.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Image Previews ({previews.length}/20):</h3>

      {/* Main Image Display */}
      <div className="relative w-full h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
        <Image
          src={previews[currentImageIndex]}
          alt={`Property image ${currentImageIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 700px"
          className="w-full h-full object-cover"
          priority={true}
        />

        {/* Navigation Arrows */}
        {previews.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Remove Current Image Button */}
        <button
          onClick={() => onRemoveImage(currentImageIndex)}
          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main Image Indicator */}
        {currentImageIndex === 0 && (
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Main Image
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
          {currentImageIndex + 1} / {previews.length}
        </div>
      </div>

      {/* Thumbnail Carousel */}
      {previews.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 cursor-pointer group"
              onClick={() => goToImage(index)}
            >
              <div className="relative w-20 h-20">
                <Image
                  src={preview}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover rounded-lg border-2 ..."
                />
              </div>


              {/* Remove button for thumbnails */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(index);
                }}
                className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Main image badge for thumbnail */}
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
};

export default ImageCarousel;
