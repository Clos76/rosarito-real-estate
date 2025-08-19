// lib/admin-functions.ts
import { httpsCallable, getFunctions, HttpsCallableResult } from "firebase/functions";
import app from "./firebase"; // your initialized Firebase app
import { User } from "firebase/auth";

// Specify the same region as your deployed Firebase functions
const functions = getFunctions(app, "us-central1");

// ---------------- Types ----------------
export interface AdminFunctionResult {
  message: string;
  success: boolean;
  isFirstAdmin?: boolean;
}

export interface UserInfo {
  uid: string;
  email: string | null;
  displayName?: string | null;
  customClaims: Record<string, boolean | string | number>;
  isAdmin: boolean;
  emailVerified: boolean;
  disabled: boolean;
  creationTime: string;
  lastSignInTime?: string;
}

export interface AdminListResult {
  admins: Array<{
    uid: string;
    email: string | null;
    displayName?: string | null;
    creationTime?: string;
    lastSignInTime?: string;
    emailVerified?: boolean;
  }>;
}

export interface SystemStats {
  totalUsers: number;
  adminCount: number;
  verifiedUsers: number;
  unverifiedUsers: number;
}

// ---------------- Callable Functions ----------------
const setAdminClaimFunction = httpsCallable<{ uid: string }, AdminFunctionResult>(functions, "setAdminClaim");
const removeAdminClaimFunction = httpsCallable<{ uid: string }, AdminFunctionResult>(functions, "removeAdminClaim");
const getUserInfoFunction = httpsCallable<{ uid: string }, UserInfo>(functions, "getUserInfo");
const listAdminsFunction = httpsCallable<void, AdminListResult>(functions, "listAdmins");
const checkAdminStatusFunction = httpsCallable<void, { isAdmin: boolean }>(functions, "checkAdminStatus");
const getSystemStatsFunction = httpsCallable<void, SystemStats>(functions, "getSystemStats");

// ---------------- Wrappers with Safety ----------------
function parseError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as { message?: string }).message || "Unknown error";
  }
  return "Unknown error";
}

/** Make a user admin */
export async function makeUserAdmin(uid: string): Promise<AdminFunctionResult> {
  if (!uid) throw new Error("UID is required to make user admin");
  try {
    const result: HttpsCallableResult<AdminFunctionResult> = await setAdminClaimFunction({ uid });
    return result.data;
  } catch (error: unknown) {
    console.error("makeUserAdmin error:", parseError(error));
    throw error;
  }
}

/** Remove admin privileges */
export async function removeUserAdmin(uid: string): Promise<AdminFunctionResult> {
  if (!uid) throw new Error("UID is required to remove admin");
  try {
    const result: HttpsCallableResult<AdminFunctionResult> = await removeAdminClaimFunction({ uid });
    return result.data;
  } catch (error: unknown) {
    console.error("removeUserAdmin error:", parseError(error));
    throw error;
  }
}

/** Get specific user's info */
export async function getUserInfo(uid: string): Promise<UserInfo> {
  if (!uid) throw new Error("UID is required to get user info");
  try {
    const result: HttpsCallableResult<UserInfo> = await getUserInfoFunction({ uid });
    return result.data;
  } catch (error: unknown) {
    console.error("getUserInfo error:", parseError(error));
    throw error;
  }
}

/** Check if current user is admin */
export async function checkAdminStatus(): Promise<{ isAdmin: boolean }> {
  try {
    const result: HttpsCallableResult<{ isAdmin: boolean }> = await checkAdminStatusFunction();
    return result.data;
  } catch (error: unknown) {
    console.error("checkAdminStatus error:", parseError(error));
    return { isAdmin: false }; // safe fallback
  }
}

/** Get current user's info including admin status */
export async function getCurrentUserInfo(currentUser: User): Promise<UserInfo> {
  if (!currentUser) throw new Error("No current user provided");
  
  const adminStatus = await checkAdminStatus();

  return {
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName,
    customClaims: adminStatus.isAdmin ? { admin: true } : {},
    isAdmin: adminStatus.isAdmin,
    emailVerified: currentUser.emailVerified,
    disabled: false,
    creationTime: currentUser.metadata?.creationTime || "",
    lastSignInTime: currentUser.metadata?.lastSignInTime || ""
  };
}

/** List all admin users */
export async function listAllAdmins(): Promise<AdminListResult> {
  try {
    const result: HttpsCallableResult<AdminListResult> = await listAdminsFunction();
    return result.data;
  } catch (error: unknown) {
    console.error("listAllAdmins error:", parseError(error));
    return { admins: [] };
  }
}

/** Get system statistics */
export async function getSystemStats(): Promise<SystemStats> {
  try {
    const result: HttpsCallableResult<SystemStats> = await getSystemStatsFunction();
    return result.data;
  } catch (error: unknown) {
    console.error("getSystemStats error:", parseError(error));
    return { totalUsers: 0, adminCount: 0, verifiedUsers: 0, unverifiedUsers: 0 };
  }
}
