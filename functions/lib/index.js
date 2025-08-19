"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStats = exports.getUserInfo = exports.listAdmins = exports.checkAdminStatus = exports.removeAdminClaim = exports.setAdminClaim = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const options_1 = require("firebase-functions/v2/options");
// Set global options for all v2 functions
(0, options_1.setGlobalOptions)({
    maxInstances: 10,
    region: 'us-central1',
});
(0, app_1.initializeApp)();
// Helper function to check if user is admin
async function checkIfAdmin(uid) {
    try {
        const user = await (0, auth_1.getAuth)().getUser(uid);
        return user.customClaims?.admin === true;
    }
    catch (error) {
        return false;
    }
}
// Helper function to check if any admins exist
async function checkIfAnyAdminsExist() {
    try {
        const listUsers = await (0, auth_1.getAuth)().listUsers();
        return listUsers.users.some((user) => user.customClaims?.admin === true);
    }
    catch (error) {
        return false;
    }
}
// Set admin claim (allows first admin, then requires admin privileges)
exports.setAdminClaim = (0, https_1.onCall)(async (request) => {
    // Check if the caller is authenticated
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { uid } = request.data;
    if (!uid) {
        throw new https_1.HttpsError('invalid-argument', 'UID is required');
    }
    try {
        // Check if any admins exist
        const anyAdminsExist = await checkIfAnyAdminsExist();
        if (anyAdminsExist) {
            // If admins exist, check if the caller is an admin
            const isAdmin = await checkIfAdmin(request.auth.uid);
            if (!isAdmin) {
                throw new https_1.HttpsError('permission-denied', 'Only admins can set admin claims');
            }
        }
        else {
            // If no admins exist, allow the current user to become the first admin
            // But only if they're trying to make themselves admin
            if (uid !== request.auth.uid) {
                throw new https_1.HttpsError('permission-denied', 'For first admin setup, you can only make yourself admin');
            }
        }
        // Set admin custom claim
        await (0, auth_1.getAuth)().setCustomUserClaims(uid, { admin: true });
        const isFirstAdmin = !anyAdminsExist;
        const message = isFirstAdmin
            ? `First admin created for user ${uid}`
            : `Admin claim set for user ${uid}`;
        return {
            success: true,
            message,
            isFirstAdmin
        };
    }
    catch (error) {
        console.error('Error in setAdminClaim:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Failed to set admin claim');
    }
});
// Remove admin claim
exports.removeAdminClaim = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const isAdmin = await checkIfAdmin(request.auth.uid);
    if (!isAdmin) {
        throw new https_1.HttpsError('permission-denied', 'Only admins can remove admin claims');
    }
    const { uid } = request.data;
    if (!uid) {
        throw new https_1.HttpsError('invalid-argument', 'UID is required');
    }
    // Prevent removing the last admin
    const listUsers = await (0, auth_1.getAuth)().listUsers();
    const adminCount = listUsers.users.filter((user) => user.customClaims?.admin === true).length;
    if (adminCount <= 1) {
        throw new https_1.HttpsError('permission-denied', 'Cannot remove the last admin');
    }
    try {
        await (0, auth_1.getAuth)().setCustomUserClaims(uid, { admin: false });
        return { success: true, message: `Admin claim removed for user ${uid}` };
    }
    catch (error) {
        throw new https_1.HttpsError('internal', 'Failed to remove admin claim');
    }
});
// Check admin status
exports.checkAdminStatus = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const isAdmin = await checkIfAdmin(request.auth.uid);
    return { isAdmin };
});
// List all admins (admin only)
exports.listAdmins = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const isAdmin = await checkIfAdmin(request.auth.uid);
    if (!isAdmin) {
        throw new https_1.HttpsError('permission-denied', 'Only admins can list admins');
    }
    try {
        const listUsers = await (0, auth_1.getAuth)().listUsers();
        const admins = listUsers.users.filter((user) => user.customClaims?.admin === true);
        return {
            admins: admins.map((admin) => ({
                uid: admin.uid,
                email: admin.email,
                displayName: admin.displayName
            }))
        };
    }
    catch (error) {
        throw new https_1.HttpsError('internal', 'Failed to list admins');
    }
});
// Get user info (admin only)
exports.getUserInfo = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const isAdmin = await checkIfAdmin(request.auth.uid);
    if (!isAdmin) {
        throw new https_1.HttpsError('permission-denied', 'Only admins can get user info');
    }
    const { uid } = request.data;
    if (!uid) {
        throw new https_1.HttpsError('invalid-argument', 'UID is required');
    }
    try {
        const user = await (0, auth_1.getAuth)().getUser(uid);
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
    }
    catch (error) {
        throw new https_1.HttpsError('internal', 'Failed to get user info');
    }
});
// Get system stats (admin only)
exports.getSystemStats = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const isAdmin = await checkIfAdmin(request.auth.uid);
    if (!isAdmin) {
        throw new https_1.HttpsError('permission-denied', 'Only admins can get system stats');
    }
    try {
        const listUsers = await (0, auth_1.getAuth)().listUsers();
        const totalUsers = listUsers.users.length;
        const adminCount = listUsers.users.filter((user) => user.customClaims?.admin === true).length;
        const verifiedUsers = listUsers.users.filter((user) => user.emailVerified).length;
        return {
            totalUsers,
            adminCount,
            verifiedUsers,
            unverifiedUsers: totalUsers - verifiedUsers
        };
    }
    catch (error) {
        throw new https_1.HttpsError('internal', 'Failed to get system stats');
    }
});
