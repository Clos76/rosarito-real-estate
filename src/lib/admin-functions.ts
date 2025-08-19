// lib/admin-functions.ts
import { httpsCallable, getFunctions } from "firebase/functions";
import  app  from "./firebase"; // your initialized Firebase app
import { User } from "firebase/auth";

// Specify the same region as your deployed Firebase functions
const functions = getFunctions(app, "us-central1");

// Initialize callable functions
const setAdminClaimFunction = httpsCallable(functions, "setAdminClaim");
const removeAdminClaimFunction = httpsCallable(functions, "removeAdminClaim");
const getUserInfoFunction = httpsCallable(functions, "getUserInfo");
const listAdminsFunction = httpsCallable(functions, "listAdmins");
const checkAdminStatusFunction = httpsCallable(functions, "checkAdminStatus");
const getSystemStatsFunction = httpsCallable(functions, "getSystemStats");

interface AdminFunctionResult {
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

interface AdminListResult {
  admins: Array<{
    uid: string;
    email: string | null;
    displayName?: string | null;
    creationTime?: string;
    lastSignInTime?: string;
    emailVerified?: boolean;
  }>;
}

interface SystemStats {
  totalUsers: number;
  adminCount: number;
  verifiedUsers: number;
  unverifiedUsers: number;
}

/** Make a user admin */
export async function makeUserAdmin(uid: string): Promise<AdminFunctionResult> {
  const result = await setAdminClaimFunction({ uid });
  return result.data as AdminFunctionResult;
}

/** Remove admin privileges */
export async function removeUserAdmin(uid: string): Promise<AdminFunctionResult> {
  const result = await removeAdminClaimFunction({ uid });
  return result.data as AdminFunctionResult;
}

/** Get specific user's info */
export async function getUserInfo(uid: string): Promise<UserInfo> {
  const result = await getUserInfoFunction({ uid });
  return result.data as UserInfo;
}

/** Check if current user is admin */
export async function checkAdminStatus(): Promise<{ isAdmin: boolean }> {
  const result = await checkAdminStatusFunction();
  return result.data as { isAdmin: boolean };
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
  const result = await listAdminsFunction();
  return result.data as AdminListResult;
}

/** Get system statistics */
export async function getSystemStats(): Promise<SystemStats> {
  const result = await getSystemStatsFunction();
  return result.data as SystemStats;
}
