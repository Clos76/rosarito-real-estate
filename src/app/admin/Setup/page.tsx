"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { makeUserAdmin, getCurrentUserInfo, listAllAdmins } from "@/lib/admin-functions";

interface UserInfo {
  uid: string;
  email: string | null;
  displayName?: string | null;
  customClaims: Record<string, unknown>;
  isAdmin: boolean;
  emailVerified: boolean;
  disabled: boolean;
  creationTime: string;
  lastSignInTime?: string;
}

interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  creationTime?: string;
  lastSignInTime?: string;
  emailVerified?: boolean;
}

export default function AdminSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [showAdminList, setShowAdminList] = useState(false);

  const showMessage = (msg: string, type: "success" | "error" | "info" = "info") => {
    setMessage(msg);
    setMessageType(type);
    if (type !== "error") {
      setTimeout(() => setMessage(""), 5000);
    }
  };

 const handleGetUserInfo = useCallback(async () => {
  if (!user) return;
  setLoading(true);
  setMessage("");

  try {
    const info = await getCurrentUserInfo(user);
    setUserInfo(info);
    showMessage("User info loaded successfully", "success");
  } catch (error: unknown) {
    console.error("Get user info error:", error);

    let errorMessage = "Failed to get user info.";
    if (error && typeof error === "object" && "code" in error) {
      const e = error as { code?: string; message?: string };
      errorMessage =
        e.code === "functions/unauthenticated"
          ? "You must be logged in to get user info."
          : e.code === "functions/unavailable"
          ? "Firebase Functions not available. Make sure you deployed your functions."
          : e.message || errorMessage;
    }
    showMessage(`Error: ${errorMessage}`, "error");
  } finally {
    setLoading(false);
  }
}, [user]); // ✅ dependency is just user


 const handleMakeAdmin = async () => {
  if (!user) return;
  setLoading(true);
  setMessage("");

  try {
    const result = await makeUserAdmin(user.uid);
    const firstAdminMessage = result.isFirstAdmin ? "🎉 You are the first admin!" : "";
    showMessage(`${result.message} ${firstAdminMessage}`, "success");
    await handleGetUserInfo();
  } catch(error:unknown){
      console.error("Get user info error:", error);

      let errorMessage = "Failed to get user info.";
      if(error && typeof error === "object" && "code" in error){
        const e=error as { code?: string; message?: string};
        errorMessage = 
        e.code === "functions/unauthenticated"
        ? "You must be looge in to get user info."
        : e.code === "functions/unavailable"
        ? "Firebase Functions not available. Make sure you deployed your functions."
        : e.message || errorMessage;
      }
      showMessage(`Error: ${errorMessage}`, "error");
    }
};


 const handleListAdmins = async () => {
  setLoading(true);
  setMessage("");

  try {
    const result = await listAllAdmins();
    setAdminList(result.admins || []);
    setShowAdminList(true);
    showMessage(`Found ${result.admins?.length || 0} admin(s)`, "success");
  }catch(error:unknown){
      console.error("Get user info error:", error);

      let errorMessage = "Failed to get user info.";
      if(error && typeof error === "object" && "code" in error){
        const e=error as { code?: string; message?: string};
        errorMessage = 
        e.code === "functions/unauthenticated"
        ? "You must be looge in to get user info."
        : e.code === "functions/unavailable"
        ? "Firebase Functions not available. Make sure you deployed your functions."
        : e.message || errorMessage;
      }
      showMessage(`Error: ${errorMessage}`, "error");
    }
};


  // Load user info automatically
  useEffect(() => {
    if (user && !userInfo) {
      handleGetUserInfo();
    }
  }, [user, userInfo, handleGetUserInfo]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the admin setup.</p>
          <Link
            href="/admin/login"
            className="inline-block py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">🏠 RealEstate Admin Setup</h1>
            <Link href="/admin/login" className="text-indigo-600 hover:text-indigo-500">
              Back to Login
            </Link>
          </div>

          {/* Current User Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
            <h3 className="font-semibold mb-2 text-blue-800">👤 Current User</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>UID:</strong> <code className="bg-blue-100 px-1 rounded text-xs">{user.uid}</code></p>
              <p>
                <strong>Email Verified:</strong>{" "}
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    user.emailVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user.emailVerified ? "YES" : "NO"}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <button
              onClick={handleMakeAdmin}
              disabled={loading}
              className="py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "⏳ Processing..." : "🚨 Make Me Admin"}
            </button>

            <button
              onClick={handleGetUserInfo}
              disabled={loading}
              className="py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "⏳ Loading..." : "📋 Check User Info"}
            </button>

            <button
              onClick={handleListAdmins}
              disabled={loading}
              className="py-3 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "⏳ Loading..." : "👥 List All Admins"}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`p-4 rounded-md border ${
                messageType === "error"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : messageType === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              <p className="font-medium">{message}</p>
            </div>
          )}

          {/* Detailed User Info */}
          {userInfo && (
            <div className="p-4 bg-gray-50 rounded-lg border mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">📊 Detailed User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>UID:</strong> <code className="bg-gray-200 px-1 rounded text-xs">{userInfo.uid}</code></p>
                  <p><strong>Email:</strong> {userInfo.email || "No email"}</p>
                  {userInfo.displayName && <p><strong>Display Name:</strong> {userInfo.displayName}</p>}
                </div>
                <div>
                  <p>
                    <strong>Is Admin:</strong>{" "}
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        userInfo.isAdmin ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {userInfo.isAdmin ? "✅ YES" : "❌ NO"}
                    </span>
                  </p>
                  <p>
                    <strong>Email Verified:</strong>{" "}
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        userInfo.emailVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {userInfo.emailVerified ? "✅ YES" : "⚠️ NO"}
                    </span>
                  </p>
                  <p>
                    <strong>Account Status:</strong>{" "}
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        userInfo.disabled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {userInfo.disabled ? "🚫 Disabled" : "✅ Active"}
                    </span>
                  </p>
                </div>
              </div>

              {userInfo.customClaims && Object.keys(userInfo.customClaims).length > 0 && (
                <div className="mt-4">
                  <strong>Custom Claims:</strong>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(userInfo.customClaims, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Admin List */}
          {showAdminList && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mb-6">
              <h3 className="font-semibold mb-3 text-purple-800">👥 All Admin Users ({adminList.length})</h3>
              {adminList.length > 0 ? (
                <div className="space-y-2">
                  {adminList.map((admin) => (
                    <div key={admin.uid} className="p-3 bg-white rounded border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{admin.email || "No email"}</p>
                          {admin.displayName && <p className="text-sm text-gray-600">{admin.displayName}</p>}
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>
                            Created: {admin.creationTime ? new Date(admin.creationTime).toLocaleDateString() : "N/A"}
                          </p>
                          {admin.lastSignInTime && (
                            <p>Last Login: {new Date(admin.lastSignInTime).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          🛡️ Admin
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            admin.emailVerified ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {admin.emailVerified ? "✉️ Verified" : "⚠️ Unverified"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-orange-700">No admins found.</p>
              )}
            </div>
          )}

          {/* Success State */}
          {userInfo?.isAdmin && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Setup Complete!</h3>
              <p className="text-sm text-green-700 mb-3">
                Congratulations! You&apos;re now an admin for your real estate platform.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
