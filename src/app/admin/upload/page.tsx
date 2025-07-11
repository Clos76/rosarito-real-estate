// app/admin/upload/page.tsx
"use client";

import { useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage, db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";

function UploadForm() {
  const { user, logout } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sqft, setSqft] = useState("");
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [brokerName, setBrokerName] = useState("");
  const [brokerContact, setBrokerContact] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > 20) {
      alert("You can upload a maximum of 20 images");
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const imageUrls: string[] = [];
    let completedUploads = 0;

    for (const image of images) {
      try {
        const storageRef = ref(storage, `properties/${Date.now()}_${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (completedUploads / images.length) * 100 + 
                             (snapshot.bytesTransferred / snapshot.totalBytes) * (100 / images.length);
              setUploadProgress(Math.round(progress));
            },
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              imageUrls.push(downloadURL);
              completedUploads++;
              resolve();
            }
          );
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
    }

    return imageUrls;
  };

  const handleUpload = async () => {
    if (images.length === 0 || !title || !price || !beds || !baths || !sqft || !address || !propertyType || !yearBuilt || !brokerName || !brokerContact) {
      return alert("Please fill out all fields and upload at least one image.");
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const imageUrls = await uploadImages();

      await addDoc(collection(db, "properties"), {
        title,
        price: Number(price),
        beds: Number(beds),
        baths: Number(baths),
        sqft: Number(sqft),
        address,
        propertyType,
        yearBuilt: Number(yearBuilt),
        listedBy: {
          name: brokerName,
          contact: brokerContact,
        },
        imageUrls: imageUrls, // Array of image URLs
        mainImage: imageUrls[0], // First image as main image
        createdAt: Timestamp.now(),
      });

      // Clear form
      setTitle("");
      setPrice("");
      setBeds("");
      setBaths("");
      setSqft("");
      setAddress("");
      setPropertyType("");
      setYearBuilt("");
      setBrokerName("");
      setBrokerContact("");
      setImages([]);
      setPreviews([]);
      setUploadProgress(0);
      alert("Upload successful!");
      setUploading(false);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upload Property</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.email}
          </span>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input type="text" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input type="text" placeholder="Bedrooms" value={beds} onChange={(e) => setBeds(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input type="text" placeholder="Bathrooms" value={baths} onChange={(e) => setBaths(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input type="text" placeholder="Square Footage" value={sqft} onChange={(e) => setSqft(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input type="text" placeholder="Year Built" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input type="text" placeholder="Property Type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input type="text" placeholder="Broker Name" value={brokerName} onChange={(e) => setBrokerName(e.target.value)} className="w-full px-4 py-2 border rounded" />
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2 border rounded" />
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Broker Contact Info" value={brokerContact} onChange={(e) => setBrokerContact(e.target.value)} className="w-full px-4 py-2 border rounded" />
      </div>

      {/* Image Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Images ({images.length}/20)
        </label>
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleImageChange} 
          className="w-full px-4 py-2 border rounded"
          disabled={images.length >= 20}
        />
        {images.length >= 20 && (
          <p className="text-sm text-red-600 mt-1">Maximum 20 images allowed</p>
        )}
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Image Previews:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-32 object-cover rounded border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                >
                  ×
                </button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      <button 
        onClick={handleUpload} 
        disabled={uploading || images.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? `Uploading... ${uploadProgress}%` : `Upload Property (${images.length} images)`}
      </button>
      
         <div className="pt-4 ">
            <button
              type="submit"
              
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <a href="/">Back</a>
            </button>
          </div>
    </div>
  );
}

export default function AdminUploadPage() {
  return (
    <ProtectedRoute>
      <UploadForm />
    </ProtectedRoute>
  );
}