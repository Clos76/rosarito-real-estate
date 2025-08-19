import {onCall, HttpsError, CallableRequest} from 'firebase-functions/v2/https';
import {initializeApp} from 'firebase-admin/app';
import {getAuth, UserRecord} from 'firebase-admin/auth';
import {setGlobalOptions} from 'firebase-functions/v2/options';

// Set global options for all v2 functions
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

initializeApp();

// Helper function to check if user is admin
async function checkIfAdmin(uid: string): Promise<boolean> {
  try {
    const user: UserRecord = await getAuth().getUser(uid);
    return user.customClaims?.admin === true;
  } catch (error) {
    return false;
  }
}

// Helper function to check if any admins exist
async function checkIfAnyAdminsExist(): Promise<boolean> {
  try {
    const listUsers = await getAuth().listUsers();
    return listUsers.users.some((user: UserRecord) => user.customClaims?.admin === true);
  } catch (error) {
    return false;
  }
}

interface SetAdminClaimData {
  uid: string;
}

interface GetUserInfoData {
  uid: string;
}

// Set admin claim (allows first admin, then requires admin privileges)
export const setAdminClaim = onCall<SetAdminClaimData>(async (request: CallableRequest<SetAdminClaimData>) => {
  // Check if the caller is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = request.data;
  if (!uid) {
    throw new HttpsError('invalid-argument', 'UID is required');
  }

  try {
    // Check if any admins exist
    const anyAdminsExist = await checkIfAnyAdminsExist();
    
    if (anyAdminsExist) {
      // If admins exist, check if the caller is an admin
      const isAdmin = await checkIfAdmin(request.auth.uid);
      if (!isAdmin) {
        throw new HttpsError('permission-denied', 'Only admins can set admin claims');
      }
    } else {
      // If no admins exist, allow the current user to become the first admin
      // But only if they're trying to make themselves admin
      if (uid !== request.auth.uid) {
        throw new HttpsError('permission-denied', 'For first admin setup, you can only make yourself admin');
      }
    }

    // Set admin custom claim
    await getAuth().setCustomUserClaims(uid, { admin: true });
    
    const isFirstAdmin = !anyAdminsExist;
    const message = isFirstAdmin 
      ? `First admin created for user ${uid}` 
      : `Admin claim set for user ${uid}`;

    return { 
      success: true, 
      message,
      isFirstAdmin
    };
  } catch (error) {
    console.error('Error in setAdminClaim:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to set admin claim');
  }
});

// Remove admin claim
export const removeAdminClaim = onCall<SetAdminClaimData>(async (request: CallableRequest<SetAdminClaimData>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const isAdmin = await checkIfAdmin(request.auth.uid);
  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can remove admin claims');
  }

  const { uid } = request.data;
  if (!uid) {
    throw new HttpsError('invalid-argument', 'UID is required');
  }

  // Prevent removing the last admin
  const listUsers = await getAuth().listUsers();
  const adminCount = listUsers.users.filter((user: UserRecord) => user.customClaims?.admin === true).length;
  
  if (adminCount <= 1) {
    throw new HttpsError('permission-denied', 'Cannot remove the last admin');
  }

  try {
    await getAuth().setCustomUserClaims(uid, { admin: false });
    return { success: true, message: `Admin claim removed for user ${uid}` };
  } catch (error) {
    throw new HttpsError('internal', 'Failed to remove admin claim');
  }
});

// Check admin status
export const checkAdminStatus = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const isAdmin = await checkIfAdmin(request.auth.uid);
  return { isAdmin };
});

// List all admins (admin only)
export const listAdmins = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const isAdmin = await checkIfAdmin(request.auth.uid);
  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can list admins');
  }

  try {
    const listUsers = await getAuth().listUsers();
    const admins = listUsers.users.filter((user: UserRecord) => user.customClaims?.admin === true);
    
    return {
      admins: admins.map((admin: UserRecord) => ({
        uid: admin.uid,
        email: admin.email,
        displayName: admin.displayName
      }))
    };
  } catch (error) {
    throw new HttpsError('internal', 'Failed to list admins');
  }
});

// Get user info (admin only)
export const getUserInfo = onCall<GetUserInfoData>(async (request: CallableRequest<GetUserInfoData>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const isAdmin = await checkIfAdmin(request.auth.uid);
  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can get user info');
  }

  const { uid } = request.data;
  if (!uid) {
    throw new HttpsError('invalid-argument', 'UID is required');
  }

  try {
    const user: UserRecord = await getAuth().getUser(uid);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      customClaims: user.customClaims || {},
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime
    };
  } catch (error) {
    throw new HttpsError('internal', 'Failed to get user info');
  }
});

// Get system stats (admin only)
export const getSystemStats = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const isAdmin = await checkIfAdmin(request.auth.uid);
  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can get system stats');
  }

  try {
    const listUsers = await getAuth().listUsers();
    const totalUsers = listUsers.users.length;
    const adminCount = listUsers.users.filter((user: UserRecord) => user.customClaims?.admin === true).length;
    const verifiedUsers = listUsers.users.filter((user: UserRecord) => user.emailVerified).length;

    return {
      totalUsers,
      adminCount,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers
    };
  } catch (error) {
    throw new HttpsError('internal', 'Failed to get system stats');
  }
});