// app/admin/test/page.tsx (Create this file temporarily for testing)
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminTestPage() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.uid);
  const [creating, setCreating] = useState(false);
  const [userDoc, setUserDoc] = useState<any>(null);

  const createAdminUser = async () => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    setCreating(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "admin",
        createdAt: new Date()
      });
      alert("Admin user document created! Refresh the page to see changes.");
    } catch (error) {
      console.error("Error creating admin user:", error);
      alert("Error creating admin user: " + error);
    } finally {
      setCreating(false);
    }
  };

  const checkUserDoc = async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setUserDoc(docSnap.data());
      } else {
        setUserDoc(null);
      }
    } catch (error) {
      console.error("Error fetching user doc:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <p><strong>User:</strong> {user ? user.email : "Not logged in"}</p>
        <p><strong>User UID:</strong> {user?.uid || "N/A"}</p>
        <p><strong>Is Admin:</strong> {isAdmin === null ? "Checking..." : isAdmin ? "Yes" : "No"}</p>
      </div>

      {user && (
        <div className="space-y-4">
          <button
            onClick={checkUserDoc}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded"
          >
            Check User Document in Firestore
          </button>

          {userDoc !== null && (
            <div className="bg-green-100 p-4 rounded">
              <h3 className="font-semibold">User Document Data:</h3>
              <pre className="text-sm mt-2">{JSON.stringify(userDoc, null, 2)}</pre>
            </div>
          )}

          {userDoc === null && (
            <div className="bg-yellow-100 p-4 rounded">
              <p>No user document found in Firestore.</p>
            </div>
          )}

          {!isAdmin && (
            <button
              onClick={createAdminUser}
              disabled={creating}
              className="w-full bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Admin User Document"}
            </button>
          )}

          {isAdmin && (
            <div className="bg-green-100 text-green-800 p-4 rounded">
              ✅ You are an admin! You should be able to access the upload page.
            </div>
          )}
        </div>
      )}

      {!user && (
        <div className="bg-red-100 text-red-800 p-4 rounded">
          Please log in first to test admin functionality.
        </div>
      )}
    </div>
  );
}