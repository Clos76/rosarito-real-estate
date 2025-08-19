import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { makeUserAdmin, getCurrentUserInfo } from "@/lib/admin-functions";
import { UserInfo } from "@/lib/admin-functions";
import type { User } from "firebase/auth"; // <-- Import Firebase User type

export default function AdminSetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleMakeAdmin = async () => {
    if (!user) return; // early return if no user
    const currentUser: User = user; // assert non-null type

    setLoading(true);
    setMessage("");
    try {
      const result = await makeUserAdmin(currentUser.uid);
      setMessage(`Success! ${result.message} Please refresh the page to see changes.`);
    } catch (error: unknown) {
      let errorMessage = "Failed to set admin claim";
      if (error && typeof error === "object" && "code" in error) {
        const e = error as { code?: string; message?: string };
        if (e.code === "functions/unauthenticated") {
          errorMessage = "You must be logged in to perform this action.";
        } else if (e.code === "functions/permission-denied") {
          errorMessage = "Permission denied. Only admins can create other admins.";
        } else {
          errorMessage = e.message || errorMessage;
        }
      }
      setMessage(`Error: ${errorMessage}`);
    }
    setLoading(false);
  };

  const handleGetUserInfo = async () => {
    if (!user) return;
    const currentUser: User = user; // assert non-null type

    setLoading(true);
    setMessage("");
    try {
      const info = await getCurrentUserInfo(currentUser);
      setUserInfo(info);
      setMessage("User info loaded successfully");
    } catch (error: unknown) {
      let errorMessage = "Failed to get user info.";
      if (error && typeof error === "object" && "code" in error) {
        const e = error as { code?: string; message?: string };
        if (e.code === "functions/unauthenticated") {
          errorMessage = "You must be logged in to get user info.";
        } else {
          errorMessage = e.message || errorMessage;
        }
      }
      setMessage(`Error: ${errorMessage}`);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Admin Setup</h2>
        <p className="text-gray-600">Please log in to set up admin access.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Admin Setup</h2>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Current User</h3>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>UID:</strong> {user.uid}
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleMakeAdmin}
            disabled={loading}
            className={
              "w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            }
          >
            {loading ? "Processing..." : "Make Me Admin (First Time Setup)"}
          </button>

          <button
            onClick={handleGetUserInfo}
            disabled={loading}
            className={
              "w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            }
          >
            {loading ? "Loading..." : "Check User Info"}
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md ${
              message.includes("Error")
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {message}
          </div>
        )}

        {userInfo && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">User Information</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
