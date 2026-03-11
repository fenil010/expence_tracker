/**
 * Google OAuth Token Verification
 * 
 * Verifies Google ID tokens using Google's tokeninfo endpoint.
 * No additional libraries needed — uses native fetch.
 */

const GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

/**
 * Verify a Google ID token and return the user's profile info.
 * 
 * @param {string} idToken - The ID token from Google Sign-In
 * @returns {Object} { sub, email, email_verified, name, picture, given_name, family_name }
 * @throws {Error} If token is invalid or verification fails
 */
export async function verifyGoogleToken(idToken) {
    if (!idToken || typeof idToken !== 'string') {
        throw new Error('Invalid ID token');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        throw new Error('GOOGLE_CLIENT_ID is not configured');
    }

    try {
        const response = await fetch(`${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(idToken)}`);

        if (!response.ok) {
            throw new Error('Token verification failed');
        }

        const payload = await response.json();

        // Verify the token was issued for our app
        if (payload.aud !== clientId) {
            throw new Error('Token was not issued for this application');
        }

        // Verify token is not expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && parseInt(payload.exp) < now) {
            throw new Error('Token has expired');
        }

        // Verify email is verified
        if (payload.email_verified !== 'true' && payload.email_verified !== true) {
            throw new Error('Google email is not verified');
        }

        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name || payload.given_name || 'User',
            picture: payload.picture || null,
            emailVerified: true,
        };
    } catch (error) {
        if (error.message.includes('Token')) {
            throw error;
        }
        throw new Error('Failed to verify Google token');
    }
}

export default verifyGoogleToken;
