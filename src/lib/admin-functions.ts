// lib/admin-functions.ts
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { User } from 'firebase/auth';

// Initialize functions
const functions = getFunctions();

// Create callable function references
const setAdminClaimFn = httpsCallable(functions, 'setAdminClaim');
const removeAdminClaimFn = httpsCallable(functions, 'removeAdminClaim');
const checkAdminStatusFn = httpsCallable(functions, 'checkAdminStatus');
const listAdminsFn = httpsCallable(functions, 'listAdmins');
const getUserInfoFn = httpsCallable(functions, 'getUserInfo');
const getSystemStatsFn = httpsCallable(functions, 'getSystemStats');

export interface UserInfo {
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

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

// Make user admin
export const makeUserAdmin = async (uid: string) => {
  try {
    const result = await setAdminClaimFn({ uid });
    return result.data as { success: boolean; message: string; isFirstAdmin?: boolean };
  } catch (error) {
    console.error('makeUserAdmin error:', error);
    throw error;
  }
};

// Remove admin privileges
export const removeUserAdmin = async (uid: string) => {
  try {
    const result = await removeAdminClaimFn({ uid });
    return result.data as { success: boolean; message: string };
  } catch (error) {
    console.error('removeUserAdmin error:', error);
    throw error;
  }
};

// Check if current user is admin
export const checkIfCurrentUserIsAdmin = async () => {
  try {
    const result = await checkAdminStatusFn();
    const data = result.data as { isAdmin: boolean };
    return data.isAdmin;
  } catch (error) {
    console.error('checkAdminStatus error:', error);
    return false;
  }
};

// Get current user info (this is what your component is calling)
export const getCurrentUserInfo = async (user: User): Promise<UserInfo> => {
  try {
    // Get the user's ID token to check claims
    const tokenResult = await user.getIdTokenResult();
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      customClaims: tokenResult.claims,
      isAdmin: tokenResult.claims.admin === true,
      emailVerified: user.emailVerified,
      disabled: false, // Client-side user objects don't have this info
      creationTime: user.metadata.creationTime || '',
      lastSignInTime: user.metadata.lastSignInTime
    };
  } catch (error) {
    console.error('getCurrentUserInfo error:', error);
    throw error;
  }
};

// List all admins (admin only)
export const listAllAdmins = async () => {
  try {
    const result = await listAdminsFn();
    return result.data as { admins: AdminUser[] };
  } catch (error) {
    console.error('listAdmins error:', error);
    throw error;
  }
};

// Get user information (admin only)
export const getUserInformation = async (uid: string) => {
  try {
    const result = await getUserInfoFn({ uid });
    return result.data as UserInfo;
  } catch (error) {
    console.error('getUserInfo error:', error);
    throw error;
  }
};

// Get system statistics (admin only)
export const getSystemStatistics = async () => {
  try {
    const result = await getSystemStatsFn();
    return result.data as {
      totalUsers: number;
      adminCount: number;
      verifiedUsers: number;
      unverifiedUsers: number;
    };
  } catch (error) {
    console.error('getSystemStats error:', error);
    throw error;
  }
};